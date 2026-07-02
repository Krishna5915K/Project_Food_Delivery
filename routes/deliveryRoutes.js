const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Views
router.get('/delivery/login', deliveryController.getLogin);
router.get('/delivery/dashboard', protect, restrictTo('delivery_boy'), deliveryController.getDashboard);
router.get('/delivery/assigned', protect, restrictTo('delivery_boy'), deliveryController.getAssignedOrders);
router.get('/delivery/orders', protect, restrictTo('delivery_boy'), deliveryController.getOrderHistory);
router.get('/delivery/location', protect, restrictTo('delivery_boy'), deliveryController.getLiveLocation);
router.get('/delivery/earnings', protect, restrictTo('delivery_boy'), deliveryController.getEarnings);
router.get('/delivery/profile', protect, restrictTo('delivery_boy'), deliveryController.getProfile);

// APIs
router.post('/api/v1/delivery/location', protect, restrictTo('delivery_boy'), deliveryController.updateLocationAPI);
router.put('/api/v1/delivery/orders/:orderId/status', protect, restrictTo('delivery_boy', 'restaurant_owner'), deliveryController.updateOrderStatusAPI);

module.exports = router;
