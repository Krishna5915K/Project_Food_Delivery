const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        unique: true,
        trim: true,
        match: [
            /^\+?[1-9]\d{1,14}$/,
            'Please provide a valid phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'restaurant_owner', 'delivery_boy', 'admin'],
        default: 'customer'
    },
    permissions: {
        type: [String],
        default: []
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    googleId: {
        type: String,
        default: ''
    },
    verificationToken: String,
    verificationExpiry: Date

}, { timestamps: true });

// Hash password and initialize permissions before saving
userSchema.pre('save', async function () {
    if (this.role === 'restaurant_owner' && (!this.permissions || this.permissions.length === 0)) {
        this.permissions = [
            'manage_restaurant',
            'manage_menu',
            'manage_orders',
            'manage_offers',
            'view_statistics',
            'monitor_riders'
        ];
    }

    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (Password) {
    return await bcrypt.compare(Password, this.password);
};

userSchema.methods.getToken = function() {
    return jwt.sign({
        id : this._id,
        email : this.email,
        role : this.role
    }, process.env.JWT_SECRET || 'RestaurantSecretKey123!');
}

userSchema.methods.getverificationToken = function(){
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.verificationExpiry = Date.now() + 60*60*1000;  //3600000
    return verificationToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
