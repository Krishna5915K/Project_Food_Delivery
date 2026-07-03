const express = require('express');
const ownerController = require('../controllers/ownerController');
const { protect, restrictTo, checkPermission } = require('../middleware/auth');
const upload = require('../utils/imageUpload');

const router = express.Router();

// Views
router.get('/owner/login', ownerController.getLogin);
router.get('/owner/dashboard', protect, restrictTo('restaurant_owner'), ownerController.getDashboard);
router.get('/owner/restaurant', protect, restrictTo('restaurant_owner'), checkPermission('manage_restaurant'), ownerController.getRestaurant);
router.get('/owner/menu', protect, restrictTo('restaurant_owner'), checkPermission('manage_menu'), ownerController.getMenu);
router.get('/owner/orders', protect, restrictTo('restaurant_owner'), checkPermission('manage_orders'), ownerController.getOrders);
router.get('/owner/sales', protect, restrictTo('restaurant_owner'), checkPermission('view_statistics'), ownerController.getSalesReport);
router.get('/owner/profile', protect, restrictTo('restaurant_owner'), ownerController.getProfile);
router.get('/owner/riders', protect, restrictTo('restaurant_owner'), checkPermission('monitor_riders'), ownerController.getRiders);
router.get('/owner/offers', protect, restrictTo('restaurant_owner'), checkPermission('manage_offers'), ownerController.getOffers);

// APIs
router.post(
    '/api/v1/owner/restaurant',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_restaurant'),
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    ownerController.updateRestaurant
);

router.post(
    '/api/v1/owner/menu',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_menu'),
    upload.single('image'),
    ownerController.createFoodItem
);

router.put(
    '/api/v1/owner/menu/:id',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_menu'),
    upload.single('image'),
    ownerController.updateFoodItem
);

router.delete(
    '/api/v1/owner/menu/:id',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_menu'),
    ownerController.deleteFoodItem
);

// Owner Offers APIs
router.post(
    '/api/v1/owner/offers',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_offers'),
    ownerController.createOffer
);

router.put(
    '/api/v1/owner/offers/:id',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_offers'),
    ownerController.updateOffer
);

router.delete(
    '/api/v1/owner/offers/:id',
    protect,
    restrictTo('restaurant_owner'),
    checkPermission('manage_offers'),
    ownerController.deleteOffer
);

module.exports = router;
