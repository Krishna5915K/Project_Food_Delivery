const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountValue: {
    type: Number, // Applicable for percentage discount
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: 1 // how many times total this coupon can be used
  },
  usedCount: {
    type: Number,
    default: 0 // How many times the coupon has already been used
  },
  usersUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // The IDs of users who have already used the coupon
  }],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }
}, {timestamps: true});

module.exports = mongoose.model('Coupon', couponSchema);
