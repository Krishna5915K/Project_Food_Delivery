const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['restaurant', 'offer', 'external'],
        required: true
    },
    linkId: {
        type: String, // Can hold Restaurant ID, Offer ID, or external link
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);