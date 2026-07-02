const User = require('../models/User');
const Order = require('../models/Order');
const OrderHistory = require('../models/OrderHistory');
const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryLiveLocation = require('../models/DeliveryLiveLocation');

class DeliveryController {
    // Render Views
    async getLogin(req, res) {
        res.render('delivery-login', { title: 'Delivery Login', error: null });
    }

    async getDashboard(req, res) {
        try {
            // Find delivery boy details
            const deliveryProfile = await DeliveryBoy.findOne({ user: req.user._id });
            const assignedOrders = await Order.find({
                deliveryBoy: req.user._id,
                orderStatus: { $in: ['confirmed', 'preparing', 'out_for_delivery'] }
            }).populate('restaurant');

            res.render('delivery-dashboard', { 
                title: 'Delivery Dashboard', 
                user: req.user,
                deliveryProfile,
                assignedOrders
            });
        } catch (error) {
            res.redirect('/login');
        }
    }

    async getAssignedOrders(req, res) {
        try {
            const orders = await Order.find({ 
                deliveryBoy: req.user._id, 
                orderStatus: { $in: ['confirmed', 'preparing', 'out_for_delivery'] } 
            }).populate('restaurant');

            res.render('delivery-assigned', { title: 'Assigned Orders', user: req.user, orders });
        } catch (error) {
            res.redirect('/delivery/dashboard');
        }
    }

    async getOrderHistory(req, res) {
        try {
            const orders = await Order.find({ 
                deliveryBoy: req.user._id, 
                orderStatus: 'delivered' 
            }).populate('restaurant');

            res.render('delivery-orders', { title: 'Delivery History', user: req.user, orders });
        } catch (error) {
            res.redirect('/delivery/dashboard');
        }
    }

    async getLiveLocation(req, res) {
        try {
            const liveLoc = await DeliveryLiveLocation.findOne({ deliveryBoy: req.user._id });
            const coords = liveLoc ? liveLoc.location.coordinates : [77.5946, 12.9716]; // Default to Bangalore coords or simple dummy
            
            res.render('delivery-location', { 
                title: 'Live Location Tracker', 
                user: req.user, 
                coords 
            });
        } catch (error) {
            res.redirect('/delivery/dashboard');
        }
    }

    async getEarnings(req, res) {
        try {
            const completedCount = await Order.countDocuments({ 
                deliveryBoy: req.user._id, 
                orderStatus: 'delivered' 
            });

            // Earnings calculation: 40 rupees per delivery + simulated tips
            const perDeliveryCharge = 40;
            const totalEarnings = completedCount * perDeliveryCharge;

            res.render('delivery-earnings', { 
                title: 'My Earnings', 
                user: req.user, 
                completedCount, 
                totalEarnings 
            });
        } catch (error) {
            res.redirect('/delivery/dashboard');
        }
    }

    async getProfile(req, res) {
        try {
            const deliveryBoy = await DeliveryBoy.findOne({ user: req.user._id });
            res.render('delivery-profile', { title: 'My Profile', user: req.user, deliveryBoy });
        } catch (error) {
            res.redirect('/delivery/dashboard');
        }
    }

    // API Handling
    async updateLocationAPI(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const coordinates = [parseFloat(longitude), parseFloat(latitude)];

            // Update in DeliveryBoy model
            await DeliveryBoy.findOneAndUpdate(
                { user: req.user._id },
                { currentLocation: { type: 'Point', coordinates } }
            );

            // Update in DeliveryLiveLocation model
            await DeliveryLiveLocation.findOneAndUpdate(
                { deliveryBoy: req.user._id },
                { location: { type: 'Point', coordinates } },
                { upsert: true, new: true }
            );

            res.status(200).json({ success: true, message: 'Location updated successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateOrderStatusAPI(req, res) {
        try {
            const { orderId } = req.params;
            const { status, comment } = req.body;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            order.orderStatus = status;
            if (status === 'delivered') {
                order.paymentStatus = 'completed'; // auto mark as completed on delivery
            }
            await order.save();

            // Save order history
            await OrderHistory.create({
                order: orderId,
                status,
                comment: comment || `Status updated by Delivery Boy.`,
                updatedBy: req.user._id
            });

            res.status(200).json({ success: true, message: `Order status updated to ${status}.` });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DeliveryController();
