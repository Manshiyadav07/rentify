const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fiction',
      'Non-Fiction',
      'Technology',
      'Self-Help',
      'Business',
      'Psychology',
      'Science',
      'Academic',
      'Literature',
      'Philosophy',
      'Biography',
      'Other'
    ],
    index: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number,
    min: 1800,
    max: 2050
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Rental price is required'],
    min: [0, 'Rental price cannot be negative']
  },
  securityDeposit: {
    type: Number,
    default: 100,
    min: [0, 'Deposit cannot be negative']
  },
  rentalDurationDays: {
    type: Number,
    default: 14,
    min: 1
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  numReviews: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  rentalCount: {
    type: Number,
    default: 0,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'UNAVAILABLE', 'DISCONTINUED'],
    default: 'AVAILABLE'
  }
}, { timestamps: true });

// Text index for full-text search across Title, Author, Description, Category, Tags
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  tags: 'text',
  category: 'text'
}, {
  weights: {
    title: 10,
    author: 7,
    tags: 5,
    category: 4,
    description: 2
  }
});

// Compound indexes for high performance query filtering & sorting
bookSchema.index({ category: 1, rentalPrice: 1 });
bookSchema.index({ category: 1, averageRating: -1 });
bookSchema.index({ availableCopies: 1, rentalPrice: 1 });

module.exports = mongoose.model('Book', bookSchema);
