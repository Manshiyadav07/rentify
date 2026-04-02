const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['Book', 'Notes', 'PYQ'],
    required: true
  },
  type: {
    type: String,
    enum: ['Rent', 'Donate'],
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair', 'Poor'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Available', 'Taken'],
    default: 'Available'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);