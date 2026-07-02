const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

class AuthController {
    // Render Views
    async getLogin(req, res) {
        res.render('login', { title: 'Sign In', error: null, success: null });
    }

    async getRegister(req, res) {
        res.render('register', { title: 'Create Account', error: null });
    }

    async getForgotPassword(req, res) {
        res.render('forgot-password', { title: 'Forgot Password', error: null, success: null });
    }

    async getResetPassword(req, res) {
        const token = req.query.token || '';
        res.render('reset-password', { title: 'Reset Password', token, error: null, success: null });
    }

    async getVerifyEmail(req, res) {
        const { token } = req.params;
        try {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const user = await User.findOne({
                verificationToken: hashedToken,
                verificationExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('verify-email', { title: 'Verification Failed', success: false, message: 'Verification link is invalid or expired.' });
            }

            user.isEmailVerified = true;
            user.verificationToken = undefined;
            user.verificationExpiry = undefined;
            await user.save();

            res.render('verify-email', { title: 'Verification Success', success: true, message: 'Your email has been verified successfully!' });
        } catch (error) {
            res.render('verify-email', { title: 'Error', success: false, message: error.message });
        }
    }

    // API Handling
    async register(req, res) {
        try {
            const { name, email, phone, password, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered.' });
            }

            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'Phone number already registered.' });
            }

            // Public registration only allows customer role
            const userRole = (role === 'admin' || role === 'restaurant_owner' || role === 'delivery_boy') ? 'customer' : (role || 'customer');

            const user = await User.create({
                name,
                email,
                phone,
                password,
                role: userRole,
                isEmailVerified: true
            });

            res.status(201).json({
                success: true,
                message: 'Registration Successful.'
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide email and password.' });
            }

            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ success: false, message: `Your account is ${user.status}.` });
            }

            const token = generateToken(user._id, user.role);

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.status(200).json({
                success: true,
                message: 'Login successful.',
                token,
                role: user.role
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ success: false, message: 'No account registered with that email.' });
            }

            const resetTokenRaw = crypto.randomBytes(20).toString('hex');
            const resetToken = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');
            const resetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

            user.verificationToken = resetToken;
            user.verificationExpiry = resetExpiry;
            await user.save();

                        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetTokenRaw}`;
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message: `Reset your password here: ${resetUrl} (Valid for 10 minutes)`
            });

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to your email.'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                verificationToken: hashedToken,
                verificationExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired.' });
            }

            user.password = password;
            user.verificationToken = undefined;
            user.verificationExpiry = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password updated successfully. You can now login.'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async logout(req, res) {
        res.clearCookie('token');
        res.redirect('/login');
    }
}

module.exports = new AuthController();
