const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
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
  queuePosition: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['WAITING', 'NOTIFIED', 'CONVERTED', 'EXPIRED', 'CANCELLED'],
    default: 'WAITING',
    index: true
  },
  notifiedAt: {
    type: Date,
    default: null
  },
  reservationExpiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

reservationSchema.index({ book: 1, status: 1, queuePosition: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
