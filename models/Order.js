const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [{
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        addons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Addon'
        }]
    }],
    deliveryAddress: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card', 'wallet'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
        default: 'placed'
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryBoyStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'none'],
        default: 'none'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
