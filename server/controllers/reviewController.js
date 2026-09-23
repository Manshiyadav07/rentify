const Review = require('../models/Review');
const Rental = require('../models/Rental');
const Book = require('../models/Book');

// Helper to recalculate average rating & count on the Book model
const updateBookRatingStats = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

// @desc    Add review for a book
// @route   POST /api/reviews/:bookId
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Verified Rental Check: has this user rented this book?
    const hasRented = await Rental.exists({
      user: req.user._id,
      book: bookId
    });

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: bookId
    });

    let review;
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.title = title || existingReview.title;
      existingReview.comment = comment.trim();
      existingReview.isVerifiedRental = Boolean(hasRented);
      review = await existingReview.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        book: bookId,
        rating,
        title: title || '',
        comment: comment.trim(),
        isVerifiedRental: Boolean(hasRented)
      });
    }

    // Recalculate book rating statistics
    await updateBookRatingStats(bookId);

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a book with rating breakdown
// @route   GET /api/reviews/:bookId
// @access  Public
const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const [reviews, breakdown] = await Promise.all([
      Review.find({ book: bookId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { book: bookId } },
        { $group: { _id: '$rating', count: { $sum: 1 } } }
      ])
    ]);

    // Build distribution map (1 star to 5 star)
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    res.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
      ratingDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const bookId = review.book;
    await review.deleteOne();

    await updateBookRatingStats(bookId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an inappropriate review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isReported = true;
    await review.save();

    res.json({ success: true, message: 'Review has been reported for moderation.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getBookReviews,
  deleteReview,
  reportReview
};
