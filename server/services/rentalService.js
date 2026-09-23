const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const lateFeeService = require('./lateFeeService');
const reservationService = require('./reservationService');

class RentalService {
  /**
   * Concurrency-Safe Atomic Rental Checkout
   * Uses MongoDB conditional update ({ availableCopies: { $gt: 0 } })
   * to guarantee that simultaneous requests never oversell or double-book.
   */
  async rentBookAtomic({
    userId,
    bookId,
    rentalDays = 14,
    orderId = '',
    paymentId = '',
    invoiceId = ''
  }) {
    // 1. Fetch book details for price calculation (never trusting client-submitted prices)
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.status !== 'AVAILABLE') {
      throw new Error('This book is currently not available for rental.');
    }

    // 2. ATOMIC CONDITIONAL UPDATE:
    // Decrement availableCopies ONLY if availableCopies is strictly greater than 0.
    // MongoDB guarantees this operation is atomic at the document level.
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 },
        status: 'AVAILABLE'
      },
      {
        $inc: { availableCopies: -1, rentalCount: 1 }
      },
      { new: true }
    );

    // If updatedBook is null, zero copies remained at the moment of execution
    if (!updatedBook) {
      const error = new Error('Book is currently out of stock. All copies have been rented.');
      error.code = 'OUT_OF_STOCK';
      throw error;
    }

    // 3. Atomically reserve one physical copy
    let copy = await BookCopy.findOneAndUpdate(
      { book: bookId, status: 'AVAILABLE' },
      { status: 'RENTED' },
      { new: true }
    );

    // If physical copies haven't been seeded yet, auto-create one
    if (!copy) {
      copy = await BookCopy.create({
        copyId: `CPY-${book._id.toString().slice(-4).toUpperCase()}-${Date.now().toString().slice(-3)}`,
        book: book._id,
        condition: 'GOOD',
        status: 'RENTED',
        location: 'Main Hub - Shelf A1'
      });
    }

    // 4. Calculate dates and pricing
    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(rentalDays));

    const rentalPrice = book.rentalPrice;
    const securityDeposit = book.securityDeposit || 0;
    const totalAmount = rentalPrice + securityDeposit;

    const rentalId = `RNT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Create Rental document
    const rental = await Rental.create({
      rentalId,
      user: userId,
      book: bookId,
      bookCopy: copy._id,
      startDate,
      dueDate,
      rentalDays: Number(rentalDays),
      rentalPrice,
      securityDeposit,
      totalAmount,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      orderId,
      paymentId,
      invoiceId
    });

    // Link rental to copy
    copy.currentRental = rental._id;
    await copy.save();

    // 6. Send in-app notification
    await Notification.create({
      user: userId,
      type: 'RENTAL_CONFIRMED',
      title: 'Rental Confirmed!',
      message: `Your rental for "${book.title}" is confirmed. Due date: ${dueDate.toLocaleDateString('en-IN')}.`,
      link: '/rental-history',
      metadata: { rentalId, bookId, dueDate }
    });

    return rental;
  }

  // Request book return (by user)
  async requestReturn(userId, rentalId, notes = '') {
    const rental = await Rental.findOne({ _id: rentalId, user: userId });
    if (!rental) throw new Error('Rental record not found');

    if (rental.status !== 'ACTIVE' && rental.status !== 'OVERDUE') {
      throw new Error(`Cannot request return for rental with status '${rental.status}'`);
    }

    rental.status = 'RETURN_REQUESTED';
    rental.returnRequestedAt = new Date();
    if (notes) rental.returnNotes = notes;
    await rental.save();

    return rental;
  }

  // Admin processes the return after physical inspection
  async processAdminReturn({
    rentalId,
    condition = 'GOOD', // 'GOOD', 'DAMAGED', 'LOST'
    adminNotes = ''
  }) {
    const rental = await Rental.findById(rentalId).populate('book').populate('user');
    if (!rental) throw new Error('Rental record not found');

    if (rental.status === 'RETURNED' || rental.status === 'CANCELLED') {
      throw new Error(`Rental is already finalized as '${rental.status}'`);
    }

    const returnDate = new Date();
    rental.returnedDate = returnDate;
    rental.returnCondition = condition;

    // Calculate late fee
    const { daysOverdue, lateFee } = lateFeeService.calculateFee(rental.dueDate, returnDate);
    rental.lateFee = lateFee;

    // Calculate damage fee if condition is not GOOD
    let damageFee = 0;
    if (condition === 'DAMAGED') {
      damageFee = Math.round(rental.securityDeposit * 0.5); // 50% deduction
    } else if (condition === 'LOST') {
      damageFee = rental.securityDeposit; // 100% deduction
    }
    rental.damageFee = damageFee;

    // Calculate refunded deposit
    const refundedDeposit = Math.max(0, rental.securityDeposit - lateFee - damageFee);
    rental.refundedDeposit = refundedDeposit;
    rental.status = 'RETURNED';
    if (adminNotes) rental.notes = adminNotes;
    await rental.save();

    // Update physical copy status
    if (rental.bookCopy) {
      const copyStatus = condition === 'LOST' ? 'LOST' : condition === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
      await BookCopy.findByIdAndUpdate(rental.bookCopy, {
        condition,
        status: copyStatus,
        currentRental: null
      });
    }

    // If returned in usable condition, restore available copies & process waiting queue
    if (condition !== 'LOST') {
      await Book.findByIdAndUpdate(rental.book._id, {
        $inc: { availableCopies: 1 }
      });

      // Notify next user in waiting queue if any
      await reservationService.processNextInQueue(rental.book._id);
    }

    // Send return completion notification
    await Notification.create({
      user: rental.user._id,
      type: 'RETURN_PROCESSED',
      title: 'Book Return Processed',
      message: `Return processed for "${rental.book.title}". Condition: ${condition}. Late fee: ₹${lateFee}. Refunded deposit: ₹${refundedDeposit}.`,
      link: '/rental-history',
      metadata: { rentalId: rental.rentalId, refundedDeposit, lateFee, damageFee }
    });

    return rental;
  }
}

module.exports = new RentalService();
