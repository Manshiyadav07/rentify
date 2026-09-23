const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  copyId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR'],
    default: 'GOOD'
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'RENTED', 'DAMAGED', 'LOST', 'MAINTENANCE'],
    default: 'AVAILABLE',
    index: true
  },
  location: {
    type: String,
    default: 'Main Hub - Shelf A1'
  },
  currentRental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

bookCopySchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('BookCopy', bookCopySchema);
