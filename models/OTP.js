const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['login', 'register', 'password_reset', 'email_verification', 'phone_verification'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document auto-deletes when expiresAt is reached
    }
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
