const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const DeliveryBoy = require('../models/DeliveryBoy');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');

class AdminController {
    // Render Views
    async getLogin(req, res) {
        res.render('admin-login', { title: 'Admin Login', error: null });
    }

    async getDashboard(req, res) {
        try {
            const userCount = await User.countDocuments();
            const restaurantCount = await Restaurant.countDocuments();
            const orderCount = await Order.countDocuments();

            // Total revenue
            const payments = await Payment.find({ status: 'completed' });
            const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

            // Recent orders
            const recentOrders = await Order.find()
                .populate('user', 'name')
                .populate('restaurant', 'name')
                .sort({ createdAt: -1 })
                .limit(5);

            res.render('admin-dashboard', {
                title: 'Admin Dashboard',
                user: req.user,
                stats: { userCount, restaurantCount, orderCount, totalRevenue },
                recentOrders
            });
        } catch (error) {
            res.redirect('/login');
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find().sort({ createdAt: -1 });
            res.render('admin-users', { title: 'Manage Users', user: req.user, users });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getRestaurants(req, res) {
        try {
            const restaurants = await Restaurant.find().populate('owner', 'name email').sort({ createdAt: -1 });
            const owners = await User.find({ role: 'restaurant_owner' });
            res.render('admin-restaurants', { title: 'Manage Restaurants', user: req.user, restaurants, owners });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getCategories(req, res) {
        try {
            const categories = await Category.find().populate('restaurant', 'name').sort({ createdAt: -1 });
            const restaurants = await Restaurant.find();
            res.render('admin-categories', { title: 'Manage Categories', user: req.user, categories, restaurants });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getFoods(req, res) {
        try {
            const foods = await Food.find().populate('restaurant', 'name').populate('category', 'name').sort({ createdAt: -1 });
            const restaurants = await Restaurant.find();
            const categories = await Category.find();
            res.render('admin-foods', { title: 'Manage Foods', user: req.user, foods, restaurants, categories });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await Order.find()
                .populate('user', 'name')
                .populate('restaurant', 'name')
                .populate('deliveryBoy', 'name')
                .sort({ createdAt: -1 });

            const deliveryBoys = await User.find({ role: 'delivery_boy', status: 'active' });

            res.render('admin-orders', { title: 'Manage Orders', user: req.user, orders, deliveryBoys });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getPayments(req, res) {
        try {
            const payments = await Payment.find()
                .populate('user', 'name email')
                .populate('order')
                .sort({ createdAt: -1 });

            res.render('admin-payments', { title: 'Manage Payments', user: req.user, payments });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getReports(req, res) {
        try {
            const orders = await Order.find({ orderStatus: 'delivered' });
            const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

            // Calculate status breakdown
            const orderStatusBreakdown = await Order.aggregate([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
            ]);

            res.render('admin-reports', {
                title: 'Sales & System Reports',
                user: req.user,
                report: { revenue, totalOrders: orders.length, breakdown: orderStatusBreakdown }
            });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getOffers(req, res) {
        try {
            const coupons = await Coupon.find().populate('restaurant', 'name').sort({ createdAt: -1 });
            const restaurants = await Restaurant.find().sort({ name: 1 });
            res.render('admin-offers', { title: 'Manage Offers', user: req.user, coupons, restaurants });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    async getSettings(req, res) {
        try {
            let settings = await Setting.find().sort({ key: 1 });
            if (settings.length === 0) {
                const defaults = [
                    { key: 'site_name', value: 'Food Platform', description: 'Name of the platform' },
                    { key: 'contact_email', value: 'support@Food Platform.com', description: 'Support contact email' },
                    { key: 'commission_rate', value: '10', description: 'Restaurant order commission percentage (%)' },
                    { key: 'base_delivery_charge', value: '40', description: 'Flat base delivery pay for rider per run (₹)' }
                ];
                await Setting.insertMany(defaults);
                settings = await Setting.find().sort({ key: 1 });
            }
            res.render('admin-settings', { title: 'System Settings', user: req.user, settings });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    }

    // API CRUD Endpoints for Admin

    // Create staff users (Owner, Delivery Boy, Admin)
    async createUser(req, res) {
        try {
            const { name, email, phone, password, role, permissions } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already exists.' });
            }

            const userData = {
                name,
                email,
                phone,
                password,
                role,
                isEmailVerified: true // Pre-verify staff
            };

            if (permissions) {
                userData.permissions = Array.isArray(permissions) ? permissions : [permissions];
            }

            const newUser = await User.create(userData);

            // If delivery boy, create delivery boy specific table record
            if (role === 'delivery_boy') {
                const { vehicleType, vehicleNumber, licenseNumber } = req.body;
                await DeliveryBoy.create({
                    user: newUser._id,
                    vehicleType: vehicleType || 'bike',
                    vehicleNumber: vehicleNumber || 'N/A',
                    licenseNumber: licenseNumber || 'N/A'
                });
            }

            res.status(201).json({ success: true, message: `${role} created successfully.`, data: newUser });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { name, email, phone, role, permissions, status } = req.body;

            const updates = { name, email, phone, role, status };
            if (permissions) {
                updates.permissions = Array.isArray(permissions) ? permissions : [permissions];
            } else if (role === 'restaurant_owner') {
                updates.permissions = []; // If empty array / cleared
            }

            const updatedUser = await User.findByIdAndUpdate(id, updates, { returnDocument: 'after' });

            if (role === 'delivery_boy') {
                const { vehicleType, vehicleNumber, licenseNumber } = req.body;
                if (vehicleType || vehicleNumber || licenseNumber) {
                    await DeliveryBoy.findOneAndUpdate(
                        { user: id },
                        { vehicleType, vehicleNumber, licenseNumber },
                        { upsert: true, returnDocument: 'after' }
                    );
                }
            }

            res.status(200).json({ success: true, message: 'User updated successfully.', data: updatedUser });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await User.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
            res.status(200).json({ success: true, message: 'User status updated.', data: updated });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async createRestaurant(req, res) {
        try {
            const { name, owner, description, address, cuisineType, deliveryTimeMinutes, minOrderAmount } = req.body;

            const cuisines = cuisineType ? cuisineType.split(',').map(c => c.trim()) : [];

            const restaurant = await Restaurant.create({
                name,
                owner,
                description,
                address,
                cuisineType: cuisines,
                deliveryTimeMinutes: parseInt(deliveryTimeMinutes, 10) || 30,
                minOrderAmount: parseFloat(minOrderAmount) || 0,
                isApproved: true,
                status: 'open',
                location: {
                    type: 'Point',
                    coordinates: [77.5946, 12.9716] // Bangalore center defaults
                }
            });

            res.status(201).json({ success: true, message: 'Restaurant created successfully.', data: restaurant });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async approveRestaurant(req, res) {
        try {
            const { id } = req.params;
            const { isApproved } = req.body;

            const restaurant = await Restaurant.findByIdAndUpdate(id, { isApproved }, { returnDocument: 'after' });
            res.status(200).json({ success: true, message: 'Restaurant status updated.', data: restaurant });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async assignDeliveryBoy(req, res) {
        try {
            const { orderId } = req.params;
            const { deliveryBoyId } = req.body;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            order.deliveryBoy = deliveryBoyId;
            order.deliveryBoyStatus = 'pending';
            order.orderStatus = 'confirmed'; // confirm order when assigning boy
            await order.save();

            res.status(200).json({ success: true, message: 'Delivery boy assigned successfully. Request sent.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async createOffer(req, res) {
        try {
            const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiresAt, isActive, usageLimit, restaurant } = req.body;

            const offerData = {
                code,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: parseFloat(minOrderValue) || 0,
                maxDiscountValue: parseFloat(maxDiscountValue) || 0,
                expiresAt,
                isActive: isActive === 'true' || isActive === true,
                usageLimit: parseInt(usageLimit, 10) || 1
            };

            if (restaurant && restaurant.trim() !== '') {
                offerData.restaurant = restaurant;
            }

            const coupon = await Coupon.create(offerData);
            res.status(201).json({ success: true, message: 'Offer created successfully.', data: coupon });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateOffer(req, res) {
        try {
            const { id } = req.params;
            const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiresAt, isActive, usageLimit, restaurant } = req.body;

            const offerData = {
                code,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: parseFloat(minOrderValue) || 0,
                maxDiscountValue: parseFloat(maxDiscountValue) || 0,
                expiresAt,
                isActive: isActive === 'true' || isActive === true,
                usageLimit: parseInt(usageLimit, 10) || 1
            };

            if (restaurant && restaurant.trim() !== '') {
                offerData.restaurant = restaurant;
            } else {
                offerData.restaurant = undefined;
            }

            const coupon = await Coupon.findByIdAndUpdate(id, offerData, { returnDocument: 'after' });
            res.status(200).json({ success: true, message: 'Offer updated successfully.', data: coupon });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteOffer(req, res) {
        try {
            const { id } = req.params;
            await Coupon.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            if (settings) {
                for (const [key, value] of Object.entries(settings)) {
                    await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
                }
            }
            res.status(200).json({ success: true, message: 'System settings updated successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AdminController();
