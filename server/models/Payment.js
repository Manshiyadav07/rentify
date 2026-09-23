const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  paymentId: {
    type: String,
    sparse: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['CREATED', 'CAPTURED', 'FAILED', 'REFUNDED'],
    default: 'CREATED',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay'
  },
  signature: {
    type: String,
    default: ''
  },
  receipt: {
    type: String,
    default: ''
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorDescription: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
