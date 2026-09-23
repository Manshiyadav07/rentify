const User = require('../models/User');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Rental = require('../models/Rental');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const rentalService = require('../services/rentalService');
const inventoryService = require('../services/inventoryService');
const lateFeeService = require('../services/lateFeeService');

// @desc    Get aggregated analytics for Admin Dashboard
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Core metric counts
    const [
      totalUsers,
      totalBooks,
      totalCopies,
      activeRentals,
      overdueRentals,
      totalReservations,
      returnedRentals
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments({ status: { $ne: 'DISCONTINUED' } }),
      BookCopy.countDocuments(),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Rental.countDocuments({ status: 'OVERDUE' }),
      Reservation.countDocuments({ status: 'WAITING' }),
      Rental.countDocuments({ status: 'RETURNED' })
    ]);

    // 2. Revenue aggregation
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'CAPTURED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, orderCount: { $sum: 1 } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalOrders = revenueAgg[0]?.orderCount || 0;

    // 3. Revenue by Month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrends = await Payment.aggregate([
      { $match: { status: 'CAPTURED', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 4. Rentals Trend (last 6 months)
    const rentalTrends = await Rental.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 5. Most Rented Books
    const topBooks = await Book.find({ status: { $ne: 'DISCONTINUED' } })
      .select('title author rentalPrice rentalCount averageRating coverImage')
      .sort({ rentalCount: -1 })
      .limit(5);

    // 6. Category Breakdown
    const categoryDistribution = await Book.aggregate([
      { $match: { status: { $ne: 'DISCONTINUED' } } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalRentals: { $sum: '$rentalCount' } } },
      { $sort: { count: -1 } }
    ]);

    // 7. Inventory Copy Health Breakdown
    const copyConditionStats = await BookCopy.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalCopies,
        activeRentals,
        overdueRentals,
        returnedRentals,
        totalReservations,
        totalRevenue,
        totalOrders
      },
      revenueTrends,
      rentalTrends,
      topBooks,
      categoryDistribution: categoryDistribution.map(c => ({ category: c._id, count: c.count, totalRentals: c.totalRentals })),
      copyConditionStats: copyConditionStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals with filters for admin
// @route   GET /api/admin/rentals
// @access  Private/Admin
const getAllRentals = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [rentals, totalCount] = await Promise.all([
      Rental.find(filter)
        .populate('user', 'name email phone')
        .populate('book', 'title author coverImage rentalPrice securityDeposit')
        .populate('bookCopy', 'copyId condition')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Rental.countDocuments(filter)
    ]);

    res.json({
      success: true,
      rentals,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin processes return with condition check & fee calculations
// @route   POST /api/admin/rentals/:id/process-return
// @access  Private/Admin
const processAdminReturn = async (req, res, next) => {
  try {
    const { condition, adminNotes } = req.body;
    const rental = await rentalService.processAdminReturn({
      rentalId: req.params.id,
      condition: condition || 'GOOD',
      adminNotes
    });

    res.json({
      success: true,
      message: 'Return processed and inventory updated successfully',
      rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger overdue check manually
// @route   POST /api/admin/rentals/sync-overdue
// @access  Private/Admin
const syncOverdueRentals = async (req, res, next) => {
  try {
    const result = await lateFeeService.checkAndSyncOverdueRentals();
    res.json({
      success: true,
      message: `Overdue rentals synchronized. ${result.count} rental(s) updated.`,
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inventory book copies
// @route   GET /api/admin/inventory/copies
// @access  Private/Admin
const getAllCopies = async (req, res, next) => {
  try {
    const { bookId, status } = req.query;
    const filter = {};
    if (bookId) filter.book = bookId;
    if (status) filter.status = status;

    const copies = await BookCopy.find(filter)
      .populate('book', 'title author coverImage')
      .populate('currentRental', 'rentalId user dueDate')
      .sort({ copyId: 1 });

    res.json({ success: true, copies });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a physical copy status or condition
// @route   PATCH /api/admin/inventory/copies/:copyId
// @access  Private/Admin
const updateCopy = async (req, res, next) => {
  try {
    const { condition, status, notes, location } = req.body;
    const copy = await BookCopy.findOne({ copyId: req.params.copyId });
    if (!copy) {
      return res.status(404).json({ success: false, message: 'Copy not found' });
    }

    if (condition) copy.condition = condition;
    if (status) copy.status = status;
    if (notes !== undefined) copy.notes = notes;
    if (location) copy.location = location;
    await copy.save();

    // Recount available copies for the book
    const availableCount = await BookCopy.countDocuments({
      book: copy.book,
      status: 'AVAILABLE'
    });
    await Book.findByIdAndUpdate(copy.book, { availableCopies: availableCount });

    res.json({ success: true, copy });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported reviews for moderation
// @route   GET /api/admin/reviews/reported
// @access  Private/Admin
const getReportedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isReported: true })
      .populate('user', 'name email')
      .populate('book', 'title author');

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss report or delete reported review
// @route   PATCH /api/admin/reviews/:id/dismiss
// @access  Private/Admin
const dismissReport = async (req, res, next) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { isReported: false });
    res.json({ success: true, message: 'Report dismissed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getAllRentals,
  processAdminReturn,
  syncOverdueRentals,
  getAllUsers,
  updateUserRole,
  getAllCopies,
  updateCopy,
  getReportedReviews,
  dismissReport
};
