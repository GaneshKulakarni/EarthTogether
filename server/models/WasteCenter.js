const mongoose = require('mongoose');

const wasteCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['plastic', 'electronic', 'metal', 'paper', 'organic', 'glass', 'general'],
    default: 'general',
  },
  acceptedCategories: [{
    type: String,
    enum: ['plastic', 'electronic', 'metal', 'paper', 'organic', 'glass', 'general'],
  }],
  acceptedItems: [{
    type: String,
  }],
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipcode: {
    type: String,
    trim: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  operatingHours: {
    type: String,
    default: 'Mon - Sat: 9:00 AM - 7:00 PM',
  },
  scrapRates: {
    type: String,
    default: '',
  },
  paymentTypes: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 18,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
}, {
  timestamps: true,
});

// Index for geo/coordinates and category
wasteCenterSchema.index({ lat: 1, lng: 1 });
wasteCenterSchema.index({ category: 1 });
wasteCenterSchema.index({ city: 'text', name: 'text', address: 'text' });

module.exports = mongoose.model('WasteCenter', wasteCenterSchema);
