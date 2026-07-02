const User = require('../models/User');
const Address = require('../models/Address');
const Wishlist = require('../models/Wishlist');
const Food = require('../models/Food');

class UserController {
    // Render Views
    async getProfile(req, res) {
        try {
            res.render('profile', { title: 'My Profile', user: req.user });
        } catch (error) {
            res.redirect('/');
        }
    }

    async getEditProfile(req, res) {
        try {
            res.render('edit-profile', { title: 'Edit Profile', user: req.user, error: null });
        } catch (error) {
            res.redirect('/');
        }
    }

    async getAddressManagement(req, res) {
        try {
            const addresses = await Address.find({ user: req.user._id });
            res.render('address-management', { title: 'Manage Addresses', user: req.user, addresses });
        } catch (error) {
            res.redirect('/');
        }
    }

    // API Handling
    async updateProfile(req, res) {
        try {
            const { name, phone } = req.body;
            const updates = { name };

            if (phone) {
                const existingPhone = await User.findOne({ phone, _id: { $ne: req.user._id } });
                if (existingPhone) {
                    return res.status(400).json({ success: false, message: 'Phone number already in use.' });
                }
                updates.phone = phone;
            }

            if (req.file) {
                updates.profileImage = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully.',
                user: updatedUser
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async addAddress(req, res) {
        try {
            const { label, addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude } = req.body;
            
            const coordinates = [parseFloat(longitude) || 0, parseFloat(latitude) || 0];

            // If isDefault is true, set other addresses default=false
            const isDefault = req.body.isDefault === 'true' || req.body.isDefault === true;
            if (isDefault) {
                await Address.updateMany({ user: req.user._id }, { isDefault: false });
            }

            const address = await Address.create({
                user: req.user._id,
                label,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                location: {
                    type: 'Point',
                    coordinates
                },
                isDefault
            });

            res.status(201).json({
                success: true,
                message: 'Address added successfully.',
                address
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const { id } = req.params;
            const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
            if (!address) {
                return res.status(404).json({ success: false, message: 'Address not found.' });
            }

            // If we deleted default address, make another one default if possible
            if (address.isDefault) {
                const another = await Address.findOne({ user: req.user._id });
                if (another) {
                    another.isDefault = true;
                    await another.save();
                }
            }

            res.status(200).json({
                success: true,
                message: 'Address deleted successfully.'
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async toggleWishlist(req, res) {
        try {
            const { foodId } = req.body;
            let wishlist = await Wishlist.findOne({ user: req.user._id });

            if (!wishlist) {
                wishlist = await Wishlist.create({ user: req.user._id, foods: [] });
            }

            const index = wishlist.foods.indexOf(foodId);
            let message = '';
            if (index > -1) {
                wishlist.foods.splice(index, 1);
                message = 'Removed from wishlist.';
            } else {
                wishlist.foods.push(foodId);
                message = 'Added to wishlist.';
            }

            await wishlist.save();
            res.status(200).json({ success: true, message, wishlist });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getWishlist(req, res) {
        try {
            let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
                path: 'foods',
                populate: { path: 'restaurant' }
            });
            const foods = wishlist ? wishlist.foods : [];
            res.render('wishlist', { title: 'My Wishlist', user: req.user, foods });
        } catch (error) {
            res.redirect('/');
        }
    }
}

module.exports = new UserController();
