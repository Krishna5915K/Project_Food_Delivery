const Payment = require('../models/Payment');
const Order = require('../models/Order');

class PaymentController {
    async processPayment(req, res) {
        try {
            const { orderId, paymentMethod, transactionId } = req.body;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            // Create payment log
            const payment = await Payment.create({
                order: orderId,
                user: req.user._id,
                amount: order.totalAmount,
                paymentMethod,
                status: 'completed',
                transactionId: transactionId || `TXN-${Date.now()}`
            });

            // Update order status
            order.paymentStatus = 'completed';
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully.',
                payment
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getPaymentHistoryAPI(req, res) {
        try {
            const payments = await Payment.find({ user: req.user._id })
                .populate('order')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: payments });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PaymentController();
