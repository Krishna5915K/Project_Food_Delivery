const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized. Please login.'
                });
            }
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RestaurantSecretKey123!');
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            res.clearCookie('token');
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    message: 'User belonging to this token no longer exists.'
                });
            }
            return res.redirect('/login');
        }

        req.user = currentUser;
        res.locals.user = currentUser; // accessible in EJS templates
        next();
    } catch (error) {
        res.clearCookie('token');
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }
        return res.redirect('/login');
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action.'
                });
            }
            return res.status(403).render('login', { 
                title: 'Access Denied', 
                alert: 'You do not have permission to access that section.' 
            });
        }
        next();
    };
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
            }
            return res.redirect('/login');
        }

        // Admin bypasses all checks
        if (req.user.role === 'admin') {
            return next();
        }

        // Owner check
        if (req.user.role === 'restaurant_owner' && req.user.permissions && req.user.permissions.includes(permission)) {
            return next();
        }

        if (req.originalUrl.startsWith('/api/')) {
            return res.status(403).json({
                success: false,
                message: `Access Denied: You do not have the required permission: ${permission}`
            });
        }

        return res.status(403).render('login', {
            title: 'Access Denied',
            alert: `You do not have the required permission (${permission.replace('_', ' ')}) to access this section.`
        });
    };
};

module.exports = { protect, restrictTo, checkPermission };
