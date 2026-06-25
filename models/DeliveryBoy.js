const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        enum: ['bicycle', 'bike', 'scooter', 'car'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['offline', 'online', 'busy'],
        default: 'offline'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
}, { timestamps: true });

deliveryBoySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
