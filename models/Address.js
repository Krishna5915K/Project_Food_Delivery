const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
    },
    addressLine1: {
        type: String,
        required: [true, 'Please provide flat/house number and area']
    },
    addressLine2: {
        type: String
    },
    city: {
        type: String,
        required: [true, 'Please provide city']
    },
    state: {
        type: String,
        required: [true, 'Please provide state']
    },
    postalCode: {
        type: String,
        required: [true, 'Please provide postal code']
    },
    country: {
        type: String,
        default: 'India'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Please provide delivery location coordinates [lng, lat]']
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

addressSchema.index({ location: '2dsphere' }); // Earth-like geographic coordinates

module.exports = mongoose.model('Address', addressSchema);
