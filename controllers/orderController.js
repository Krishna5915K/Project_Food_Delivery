const Order = require('../models/Order');
const OrderHistory = require('../models/OrderHistory');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Address = require('../models/Address');
const Notification = require('../models/Notification');

class OrderController {
    // Render views
    async getCheckout(req, res) {
        try {
            const cart = await Cart.findOne({ user: req.user._id }).populate({
                path: 'items',
                populate: { path: 'food' }
            }).populate('restaurant');

            if (!cart || cart.items.length === 0) {
                return res.redirect('/cart');
            }

            const addresses = await Address.find({ user: req.user._id });
            res.render('checkout', { title: 'Checkout', user: req.user, cart, addresses });
        } catch (error) {
            res.redirect('/cart');
        }
    }

    async getOrderSuccess(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id).populate('restaurant');
            if (!order || order.user.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            res.render('order-success', { title: 'Order Success', user: req.user, order });
        } catch (error) {
            res.redirect('/');
        }
    }

    async getOrderHistory(req, res) {
        try {
            const orders = await Order.find({ user: req.user._id })
                .populate('restaurant')
                .populate('items.food')
                .sort({ createdAt: -1 });

            res.render('order-history', { title: 'Order History', user: req.user, orders });
        } catch (error) {
            res.redirect('/');
        }
    }

    // API endpoints
    async placeOrder(req, res) {
        try {
            const { addressId, paymentMethod } = req.body;

            const cart = await Cart.findOne({ user: req.user._id }).populate({
                path: 'items',
                populate: { path: 'food' }
            });

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Your cart is empty.' });
            }

            const addressObj = await Address.findById(addressId);
            if (!addressObj) {
                return res.status(400).json({ success: false, message: 'Invalid delivery address selected.' });
            }

            const addressString = `${addressObj.label}: ${addressObj.addressLine1}, ${addressObj.addressLine2 ? addressObj.addressLine2 + ', ' : ''}${addressObj.city}, ${addressObj.state} - ${addressObj.postalCode}`;

            // Calculate total
            let totalAmount = 0;
            const orderItems = cart.items.map(item => {
                const itemTotal = item.food.price * item.quantity;
                totalAmount += itemTotal;
                return {
                    food: item.food._id,
                    quantity: item.quantity,
                    price: item.food.price,
                    addons: item.addons
                };
            });

            // Create Order
            const order = await Order.create({
                user: req.user._id,
                restaurant: cart.restaurant,
                items: orderItems,
                deliveryAddress: addressString,
                totalAmount,
                paymentMethod: paymentMethod || 'cod',
                paymentStatus: paymentMethod === 'wallet' ? 'completed' : 'pending',
                orderStatus: 'placed'
            });

            // Log Order History
            await OrderHistory.create({
                order: order._id,
                status: 'placed',
                comment: 'Order placed by customer.',
                updatedBy: req.user._id
            });

            // Create Notification
            await Notification.create({
                user: req.user._id,
                title: 'Order Placed!',
                message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`
            });

            // If payment method is wallet, deduct user money (simulated)
            if (paymentMethod === 'wallet') {
                // Check if user has wallet balance or just simulate it for localhost
                // For simplicity, we just proceed.
            }

            // Clear Cart items
            await CartItem.deleteMany({ _id: { $in: cart.items } });
            cart.items = [];
            cart.restaurant = undefined;
            await cart.save();

            res.status(201).json({
                success: true,
                message: 'Order placed successfully.',
                orderId: order._id
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getOrderDetailsAPI(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id)
                .populate('restaurant')
                .populate('items.food')
                .populate('deliveryBoy', 'name phone');

            const history = await OrderHistory.find({ order: id })
                .populate('updatedBy', 'name role')
                .sort({ createdAt: 1 });

            res.status(200).json({ success: true, order, history });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new OrderController();
