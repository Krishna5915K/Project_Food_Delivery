const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  refundId: {
    type: String
  }
}, {
  timestamps: true
});

const Refund = mongoose.model('Refund', refundSchema);
module.exports = Refund;
