const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
    },
    addons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Addon'
    }],
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant' // Keep track of which restaurant this cart belongs to (food delivery permits items from one restaurant at a time)
    }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
