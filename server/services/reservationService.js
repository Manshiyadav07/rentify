const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const Book = require('../models/Book');

class ReservationService {
  // Join waiting list for a book when no copies are available
  async joinWaitingList(userId, bookId) {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');

    if (book.availableCopies > 0) {
      throw new Error('Copies are currently available for this book. You can rent it directly.');
    }

    // Check if user already waiting
    const existing = await Reservation.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['WAITING', 'NOTIFIED'] }
    });

    if (existing) {
      return {
        success: false,
        message: 'You are already in the waiting list for this book.',
        queuePosition: existing.queuePosition,
        status: existing.status
      };
    }

    // Find current max queue position
    const lastInQueue = await Reservation.findOne({
      book: bookId,
      status: 'WAITING'
    }).sort({ queuePosition: -1 });

    const newPosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

    const reservation = await Reservation.create({
      user: userId,
      book: bookId,
      queuePosition: newPosition,
      status: 'WAITING'
    });

    return {
      success: true,
      message: `Successfully joined waiting list at position #${newPosition}`,
      queuePosition: newPosition,
      reservationId: reservation._id
    };
  }

  // Get user waiting list position for a book
  async getUserReservationStatus(userId, bookId) {
    const reservation = await Reservation.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['WAITING', 'NOTIFIED'] }
    });

    if (!reservation) return null;

    return {
      reservationId: reservation._id,
      queuePosition: reservation.queuePosition,
      status: reservation.status,
      reservationExpiresAt: reservation.reservationExpiresAt
    };
  }

  // Called when a book copy becomes available (e.g. after return)
  // Notifies the next person in queue and grants a 24h reservation window
  async processNextInQueue(bookId) {
    const nextReservation = await Reservation.findOne({
      book: bookId,
      status: 'WAITING'
    }).sort({ queuePosition: 1 });

    if (!nextReservation) return null;

    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours window
    nextReservation.status = 'NOTIFIED';
    nextReservation.notifiedAt = new Date();
    nextReservation.reservationExpiresAt = expiryTime;
    await nextReservation.save();

    const book = await Book.findById(bookId);

    // Create In-App Notification
    await Notification.create({
      user: nextReservation.user,
      type: 'RESERVATION_AVAILABLE',
      title: 'A reserved book is now available!',
      message: `A copy of "${book.title}" is now available for you to rent. You have 24 hours to complete your rental.`,
      link: `/books/${bookId}`,
      metadata: { bookId, reservationId: nextReservation._id, expiresAt: expiryTime }
    });

    return nextReservation;
  }

  // Cancel reservation
  async cancelReservation(userId, reservationId) {
    const res = await Reservation.findOne({ _id: reservationId, user: userId });
    if (!res) throw new Error('Reservation not found');

    res.status = 'CANCELLED';
    await res.save();

    // Re-index remaining waiting users
    await Reservation.updateMany(
      { book: res.book, status: 'WAITING', queuePosition: { $gt: res.queuePosition } },
      { $inc: { queuePosition: -1 } }
    );

    return { success: true, message: 'Reservation cancelled' };
  }
}

module.exports = new ReservationService();
