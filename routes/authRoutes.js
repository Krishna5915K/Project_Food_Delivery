const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/logout', authController.logout);

router.get('/register', authController.getRegister);
router.post('/register', authController.register);

router.get('/login', authController.getLogin);
router.post('/login', authController.login);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/verify-email/:verifyToken', authController.getVerifyEmail);

module.exports = router;