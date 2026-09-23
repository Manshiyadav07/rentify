const Rental = require('../models/Rental');
const Reservation = require('../models/Reservation');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Invoice = require('../models/Invoice');
const rentalService = require('../services/rentalService');
const reservationService = require('../services/reservationService');
const paymentService = require('../services/paymentService');

// @desc    Rent a single book directly (Instant Rent)
// @route   POST /api/rentals/direct
// @access  Private
const rentSingleBook = async (req, res, next) => {
  try {
    const { bookId, rentalDays = 14, orderId, paymentId } = req.body;

    const rental = await rentalService.rentBookAtomic({
      userId: req.user._id,
      bookId,
      rentalDays,
      orderId,
      paymentId
    });

    res.status(201).json({
      success: true,
      message: 'Rental confirmed successfully!',
      rental
    });
  } catch (error) {
    if (error.code === 'OUT_OF_STOCK') {
      return res.status(409).json({
        success: false,
        code: 'OUT_OF_STOCK',
        message: error.message
      });
    }
    next(error);
  }
};

// @desc    Get all rentals for current user
// @route   GET /api/rentals/my
// @access  Private
const getMyRentals = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = { user: req.user._id };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const rentals = await Rental.find(filter)
      .populate('book', 'title author category coverImage rentalPrice securityDeposit')
      .populate('bookCopy', 'copyId condition location')
      .sort({ createdAt: -1 });

    res.json({ success: true, rentals, count: rentals.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental details
// @route   GET /api/rentals/:id
// @access  Private
const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('book')
      .populate('bookCopy');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Ensure only owner or admin can view
    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this rental' });
    }

    // Check if invoice exists
    const invoice = await Invoice.findOne({ orderId: rental.orderId });

    res.json({ success: true, rental, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return of a book
// @route   POST /api/rentals/:id/return-request
// @access  Private
const requestReturn = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const rental = await rentalService.requestReturn(req.user._id, req.params.id, notes);
    res.json({
      success: true,
      message: 'Return request submitted. Please hand over the book to the library or courier.',
      rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join waiting list for unavailable book
// @route   POST /api/rentals/waiting-list
// @access  Private
const joinWaitingList = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const result = await reservationService.joinWaitingList(req.user._id, bookId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get waiting list status for a book
// @route   GET /api/rentals/waiting-list/:bookId
// @access  Private
const getWaitingListStatus = async (req, res, next) => {
  try {
    const status = await reservationService.getUserReservationStatus(req.user._id, req.params.bookId);
    res.json({ success: true, reservation: status });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all current user reservations
// @route   GET /api/rentals/my-reservations
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book', 'title author coverImage rentalPrice availableCopies')
      .sort({ createdAt: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rentSingleBook,
  getMyRentals,
  getRentalById,
  requestReturn,
  joinWaitingList,
  getWaitingListStatus,
  getMyReservations
};
