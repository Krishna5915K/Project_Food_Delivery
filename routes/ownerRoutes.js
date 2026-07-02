const express = require('express');
const ownerController = require('../controllers/ownerController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../utils/imageUpload');

const router = express.Router();

// Views
router.get('/owner/login', ownerController.getLogin);
router.get('/owner/dashboard', protect, restrictTo('restaurant_owner'), ownerController.getDashboard);
router.get('/owner/restaurant', protect, restrictTo('restaurant_owner'), ownerController.getRestaurant);
router.get('/owner/menu', protect, restrictTo('restaurant_owner'), ownerController.getMenu);
router.get('/owner/orders', protect, restrictTo('restaurant_owner'), ownerController.getOrders);
router.get('/owner/sales', protect, restrictTo('restaurant_owner'), ownerController.getSalesReport);
router.get('/owner/profile', protect, restrictTo('restaurant_owner'), ownerController.getProfile);

// APIs
router.post(
    '/api/v1/owner/restaurant',
    protect,
    restrictTo('restaurant_owner'),
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
    upload.single('image'),
    ownerController.createFoodItem
);

router.put(
    '/api/v1/owner/menu/:id',
    protect,
    restrictTo('restaurant_owner'),
    upload.single('image'),
    ownerController.updateFoodItem
);

router.delete(
    '/api/v1/owner/menu/:id',
    protect,
    restrictTo('restaurant_owner'),
    ownerController.deleteFoodItem
);

module.exports = router;
