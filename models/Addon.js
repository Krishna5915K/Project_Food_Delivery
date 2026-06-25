const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide addon name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide addon price'],
        min: 0
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Addon', addonSchema);