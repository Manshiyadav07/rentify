const Rental = require('../models/Rental');
const Notification = require('../models/Notification');

class LateFeeService {
  constructor() {
    this.DAILY_LATE_FEE = Number(process.env.DAILY_LATE_FEE) || 10; // Default ₹10/day
  }

  // Calculate late fee for a rental based on due date and returned/current date
  calculateFee(dueDate, returnDate = new Date()) {
    const due = new Date(dueDate).getTime();
    const actualReturn = new Date(returnDate).getTime();

    if (actualReturn <= due) {
      return { daysOverdue: 0, lateFee: 0 };
    }

    const diffMs = actualReturn - due;
    const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const lateFee = daysOverdue * this.DAILY_LATE_FEE;

    return { daysOverdue, lateFee };
  }

  // Periodic or trigger check to mark overdue rentals & dispatch notifications
  async checkAndSyncOverdueRentals() {
    const now = new Date();
    
    // Find active rentals past due date
    const overdueRentals = await Rental.find({
      status: 'ACTIVE',
      dueDate: { $lt: now }
    }).populate('book', 'title').populate('user', 'name email');

    const updated = [];

    for (const rental of overdueRentals) {
      const { daysOverdue, lateFee } = this.calculateFee(rental.dueDate, now);
      rental.status = 'OVERDUE';
      rental.lateFee = lateFee;
      await rental.save();

      // Dispatch Overdue In-App Notification (avoid spamming if recently notified)
      const recentNotification = await Notification.findOne({
        user: rental.user._id,
        type: 'OVERDUE',
        'metadata.rentalId': rental.rentalId,
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!recentNotification) {
        await Notification.create({
          user: rental.user._id,
          type: 'OVERDUE',
          title: 'Book Rental Overdue',
          message: `Your rental of "${rental.book?.title}" is overdue by ${daysOverdue} day(s). Current accrued late fee: ₹${lateFee}. Please return the book as soon as possible.`,
          link: '/rental-history',
          metadata: { rentalId: rental.rentalId, daysOverdue, lateFee }
        });
      }

      updated.push(rental.rentalId);
    }

    return { count: updated.length, updatedRentals: updated };
  }
}

module.exports = new LateFeeService();
