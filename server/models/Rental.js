const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  rentalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
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
  bookCopy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookCopy',
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  returnedDate: {
    type: Date,
    default: null
  },
  rentalDays: {
    type: Number,
    required: true,
    default: 14
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  damageFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  refundedDeposit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['RESERVED', 'ACTIVE', 'RETURN_REQUESTED', 'RETURNED', 'OVERDUE', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  returnCondition: {
    type: String,
    enum: ['PENDING', 'GOOD', 'DAMAGED', 'LOST'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
    default: 'PAID'
  },
  paymentId: {
    type: String,
    default: ''
  },
  orderId: {
    type: String,
    default: ''
  },
  invoiceId: {
    type: String,
    default: ''
  },
  returnRequestedAt: {
    type: Date,
    default: null
  },
  returnNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

rentalSchema.index({ user: 1, status: 1 });
rentalSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Rental', rentalSchema);
