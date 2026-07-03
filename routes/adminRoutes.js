const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Views
router.get('/admin/login', adminController.getLogin);
router.get('/admin/dashboard', protect, restrictTo('admin'), adminController.getDashboard);
router.get('/admin/users', protect, restrictTo('admin'), adminController.getUsers);
router.get('/admin/restaurants', protect, restrictTo('admin'), adminController.getRestaurants);
router.get('/admin/categories', protect, restrictTo('admin'), adminController.getCategories);
router.get('/admin/foods', protect, restrictTo('admin'), adminController.getFoods);
router.get('/admin/orders', protect, restrictTo('admin'), adminController.getOrders);
router.get('/admin/payments', protect, restrictTo('admin'), adminController.getPayments);
router.get('/admin/reports', protect, restrictTo('admin'), adminController.getReports);
router.get('/admin/offers', protect, restrictTo('admin'), adminController.getOffers);
router.get('/admin/settings', protect, restrictTo('admin'), adminController.getSettings);

// APIs
router.post('/api/v1/admin/users', protect, restrictTo('admin'), adminController.createUser);
router.put('/api/v1/admin/users/:id', protect, restrictTo('admin'), adminController.updateUser);
router.put('/api/v1/admin/users/:id/status', protect, restrictTo('admin'), adminController.updateUserStatus);
router.patch('/api/v1/admin/users/:id/status', protect, restrictTo('admin'), adminController.updateUserStatus);

router.post('/api/v1/admin/restaurants', protect, restrictTo('admin'), adminController.createRestaurant);
router.put('/api/v1/admin/restaurants/:id/approve', protect, restrictTo('admin'), adminController.approveRestaurant);
router.patch('/api/v1/admin/restaurants/:id/approve', protect, restrictTo('admin'), adminController.approveRestaurant);

router.post('/api/v1/admin/orders/:orderId/assign', protect, restrictTo('admin', 'restaurant_owner'), adminController.assignDeliveryBoy);
router.put('/api/v1/admin/orders/:orderId/assign', protect, restrictTo('admin', 'restaurant_owner'), adminController.assignDeliveryBoy);

// Offers & Settings APIs
router.post('/api/v1/admin/offers', protect, restrictTo('admin'), adminController.createOffer);
router.put('/api/v1/admin/offers/:id', protect, restrictTo('admin'), adminController.updateOffer);
router.delete('/api/v1/admin/offers/:id', protect, restrictTo('admin'), adminController.deleteOffer);
router.put('/api/v1/admin/settings', protect, restrictTo('admin'), adminController.updateSettings);

module.exports = router;
