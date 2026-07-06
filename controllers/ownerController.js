const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

class OwnerController {
    // Render Views
    async getLogin(req, res) {
        res.render('owner-login', { title: 'Partner Login', error: null });
    }

    async getDashboard(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            
            // Read-only Platform Statistics (based on permissions)
            let platformStats = null;
            if (req.user.permissions.includes('view_statistics')) {
                const totalCustomers = await User.countDocuments({ role: 'customer' });
                const totalRiders = await User.countDocuments({ role: 'delivery_boy' });
                const totalRestaurants = await Restaurant.countDocuments();
                const totalOrders = await Order.countDocuments();
                platformStats = { totalCustomers, totalRiders, totalRestaurants, totalOrders };
            }

            if (!restaurant) {
                return res.render('owner-dashboard', { 
                    title: 'Owner Dashboard', 
                    user: req.user,
                    restaurant: null,
                    stats: null,
                    recentOrders: [],
                    platformStats
                });
            }

            const foodCount = await Food.countDocuments({ restaurant: restaurant._id });
            const orders = await Order.find({ restaurant: restaurant._id });
            const completedOrders = orders.filter(o => o.orderStatus === 'delivered');
            const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            const recentOrders = await Order.find({ restaurant: restaurant._id })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .limit(5);

            res.render('owner-dashboard', { 
                title: 'Owner Dashboard', 
                user: req.user,
                restaurant,
                stats: { foodCount, orderCount: orders.length, revenue: totalRevenue },
                recentOrders,
                platformStats
            });
        } catch (error) {
            res.redirect('/login');
        }
    }

    async getRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            res.render('owner-restaurant', { title: 'My Restaurant', user: req.user, restaurant });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async getMenu(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) return res.redirect('/owner/dashboard');

            const categories = await Category.find({ restaurant: restaurant._id });
            const foods = await Food.find({ restaurant: restaurant._id }).populate('category');

            res.render('owner-menu', { title: 'Manage Menu', user: req.user, restaurant, categories, foods });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async getOrders(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) return res.redirect('/owner/dashboard');

            const orders = await Order.find({ restaurant: restaurant._id })
                .populate('user', 'name phone')
                .populate('items.food')
                .populate('deliveryBoy', 'name phone')
                .sort({ createdAt: -1 });

            // Available delivery boys to assign
            const deliveryBoys = await User.find({ role: 'delivery_boy', status: 'active' });

            res.render('owner-orders', { title: 'Manage Orders', user: req.user, orders, deliveryBoys });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async getSalesReport(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) return res.redirect('/owner/dashboard');

            const orders = await Order.find({ restaurant: restaurant._id, orderStatus: 'delivered' });
            const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

            res.render('owner-sales', { title: 'Sales Report', user: req.user, revenue, totalSales: orders.length });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async getProfile(req, res) {
        try {
            res.render('owner-profile', { title: 'My Profile', user: req.user });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    // API Handling

    async updateRestaurant(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.status(404).json({ success: false, message: 'Restaurant not registered yet. Contact admin.' });
            }

            const { name, description, address, cuisineType, status, deliveryTimeMinutes, minOrderAmount } = req.body;
            
            const updates = {
                name,
                description,
                address,
                status,
                deliveryTimeMinutes: parseInt(deliveryTimeMinutes, 10),
                minOrderAmount: parseFloat(minOrderAmount)
            };

            if (cuisineType) {
                updates.cuisineType = cuisineType.split(',').map(c => c.trim());
            }

            if (req.files && req.files.logo) {
                updates.logo = `/uploads/${req.files.logo[0].filename}`;
            }

            if (req.files && req.files.banner) {
                updates.banner = `/uploads/${req.files.banner[0].filename}`;
            }

            const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurant._id, updates, { returnDocument: 'after' });

            res.status(200).json({ success: true, message: 'Restaurant updated successfully.', data: updatedRestaurant });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async createFoodItem(req, res) {
        try {
            const { name, description, price, category, isVeg } = req.body;
            
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.status(404).json({ success: false, message: 'No restaurant associated with this owner.' });
            }

            const image = req.file ? `/uploads/${req.file.filename}` : '';

            const food = await Food.create({
                name,
                description,
                price: parseFloat(price),
                category,
                restaurant: restaurant._id,
                isVeg: isVeg === 'true' || isVeg === true,
                image
            });

            res.status(201).json({ success: true, message: 'Menu item added successfully.', data: food });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateFoodItem(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price, category, isVeg, isAvailable } = req.body;
            
            const updates = {
                name,
                description,
                price: parseFloat(price),
                category,
                isVeg: isVeg === 'true' || isVeg === true,
                isAvailable: isAvailable === 'true' || isAvailable === true
            };

            if (req.file) {
                updates.image = `/uploads/${req.file.filename}`;
            }

            const food = await Food.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
            res.status(200).json({ success: true, message: 'Menu item updated successfully.', data: food });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteFoodItem(req, res) {
        try {
            const { id } = req.params;
            await Food.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getRiders(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.render('owner-riders', { title: 'Monitor Riders', user: req.user, riders: [], activeRuns: [] });
            }

            const riders = await User.find({ role: 'delivery_boy' }).sort({ name: 1 });
            
            const activeRuns = await Order.find({
                restaurant: restaurant._id,
                orderStatus: { $in: ['confirmed', 'preparing', 'picked_up', 'on_the_way'] }
            }).populate('deliveryBoy', 'name phone').populate('user', 'name');

            res.render('owner-riders', { title: 'Monitor Riders', user: req.user, riders, activeRuns });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async getOffers(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.render('owner-offers', { title: 'Manage Offers', user: req.user, coupons: [] });
            }

            const coupons = await Coupon.find({ restaurant: restaurant._id }).sort({ createdAt: -1 });
            res.render('owner-offers', { title: 'Manage Offers', user: req.user, coupons });
        } catch (error) {
            res.redirect('/owner/dashboard');
        }
    }

    async createOffer(req, res) {
        try {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.status(404).json({ success: false, message: 'No restaurant found for this owner.' });
            }

            const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiresAt, isActive, usageLimit } = req.body;
            
            const coupon = await Coupon.create({
                code,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: parseFloat(minOrderValue) || 0,
                maxDiscountValue: parseFloat(maxDiscountValue) || 0,
                expiresAt,
                isActive: isActive === 'true' || isActive === true,
                usageLimit: parseInt(usageLimit, 10) || 1,
                restaurant: restaurant._id
            });

            res.status(201).json({ success: true, message: 'Offer created successfully.', data: coupon });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateOffer(req, res) {
        try {
            const { id } = req.params;
            const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiresAt, isActive, usageLimit } = req.body;
            
            const coupon = await Coupon.findByIdAndUpdate(id, {
                code,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: parseFloat(minOrderValue) || 0,
                maxDiscountValue: parseFloat(maxDiscountValue) || 0,
                expiresAt,
                isActive: isActive === 'true' || isActive === true,
                usageLimit: parseInt(usageLimit, 10) || 1
            }, { returnDocument: 'after' });

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
}

module.exports = new OwnerController();
