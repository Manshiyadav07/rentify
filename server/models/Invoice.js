const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: String,
    required: true
  },
  paymentId: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: mongoose.Schema.Types.Mixed
  },
  items: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: String,
    author: String,
    rentalDays: Number,
    rentalPrice: Number,
    securityDeposit: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  securityDepositTotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'REFUNDED'],
    default: 'PAID'
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay / Online'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
