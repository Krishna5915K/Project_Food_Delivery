const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.get('/', authController.dashboard);
router.get('/logout', authController.logout);

router.get('/register', authController.register);
router.post('/register', authController.registered);

router.get('/login', authController.login);
router.post('/login', authController.logedin);

router.get('/reset-password', authController.resetPasswordView);
router.post('/reset-password', authController.resetPassword);

router.get("/verify/:verifyToken", authController.verifyEmail);

module.exports = router;