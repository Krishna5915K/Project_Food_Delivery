const mongoose = require('mongoose');

const deliveryLocationSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, { timestamps: true });

deliveryLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DeliveryLocation', deliveryLocationSchema);
