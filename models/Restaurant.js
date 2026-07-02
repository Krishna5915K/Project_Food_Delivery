const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide restaurant physical address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide coordinates [lng, lat]']
    }
  },
  cuisineType: [{
    type: String,
    trim: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'busy'],
    default: 'closed'
  },
  platform: {
    type: String,
    enum: ['Zomato', 'Swiggy', 'both'],
    default: 'both'
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  deliveryTimeMinutes: {
    type: Number,
    default: 30
  },
  minOrderAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Setup Indexes
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', cuisineType: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
