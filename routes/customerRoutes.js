const express = require('express');
const { protect } = require('../middleware/auth');
const restaurantController = require('../controllers/restaurantController');
const foodController = require('../controllers/foodController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const reviewController = require('../controllers/reviewController');
const categoryController = require('../controllers/categoryController');
const upload = require('../utils/imageUpload');

const router = express.Router();

// ----------------- Customer Page Views (Protected) -----------------
router.get('/', protect, restaurantController.getHome);
router.get('/restaurants', protect, restaurantController.getRestaurants);
router.get('/restaurants/:id', protect, restaurantController.getRestaurantDetails);
router.get('/foods/:id', protect, foodController.getFoodDetails);
router.get('/wishlist', protect, userController.getWishlist);
router.get('/profile', protect, userController.getProfile);
router.get('/profile/edit', protect, userController.getEditProfile);
router.get('/addresses', protect, userController.getAddressManagement);
router.get('/cart', protect, cartController.getCartView);
router.get('/checkout', protect, orderController.getCheckout);
router.get('/orders/history', protect, orderController.getOrderHistory);
router.get('/order-success/:id', protect, orderController.getOrderSuccess);

// ----------------- Customer REST APIs (Protected) -----------------

// User Profile & Addresses
router.patch('/api/v1/users/profile', protect, upload.single('profileImage'), userController.updateProfile);
router.post('/api/v1/users/addresses', protect, userController.addAddress);
router.delete('/api/v1/users/addresses/:id', protect, userController.deleteAddress);
router.post('/api/v1/users/wishlist', protect, userController.toggleWishlist);

// Cart
router.post('/api/v1/cart', protect, cartController.addToCart);
router.patch('/api/v1/cart/:cartItemId', protect, cartController.updateCartItem);
router.delete('/api/v1/cart/:cartItemId', protect, cartController.deleteCartItem);
router.post('/api/v1/cart/clear', protect, cartController.clearCart);

// Orders
router.post('/api/v1/orders', protect, orderController.placeOrder);

// Reviews & Ratings
router.post('/api/v1/reviews', protect, reviewController.createReviewAPI);
router.get('/api/v1/reviews', reviewController.getReviewsAPI);

// Categories
router.get('/api/v1/categories', categoryController.getCategories);
router.post('/api/v1/categories', protect, categoryController.createCategory);
router.delete('/api/v1/categories/:id', protect, categoryController.deleteCategory);

module.exports = router;
