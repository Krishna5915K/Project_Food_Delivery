const mongoose = require('mongoose');

const deliveryLiveLocationSchema = new mongoose.Schema({
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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

deliveryLiveLocationSchema.index({ location: '2dsphere' });

const DeliveryLiveLocation = mongoose.model('DeliveryLiveLocation', deliveryLiveLocationSchema);
module.exports = DeliveryLiveLocation;
