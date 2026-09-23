const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true
  },
  isVerifiedRental: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
