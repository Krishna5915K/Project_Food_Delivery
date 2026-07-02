const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Food = require('../models/Food');

class CartController {
    // Render view
    async getCartView(req, res) {
        try {
            let cart = await Cart.findOne({ user: req.user._id }).populate({
                path: 'items',
                populate: { path: 'food' }
            }).populate('restaurant');

            if (!cart) {
                cart = await Cart.create({ user: req.user._id, items: [] });
            }

            res.render('cart', { title: 'My Cart', user: req.user, cart });
        } catch (error) {
            res.redirect('/');
        }
    }

    // API endpoints
    async addToCart(req, res) {
        try {
            const { foodId, quantity, addons } = req.body;
            const qty = parseInt(quantity, 10) || 1;

            const food = await Food.findById(foodId);
            if (!food) {
                return res.status(404).json({ success: false, message: 'Food item not found.' });
            }

            let cart = await Cart.findOne({ user: req.user._id });
            if (!cart) {
                cart = await Cart.create({ user: req.user._id, items: [], restaurant: food.restaurant });
            }

            // Check restaurant match
            if (cart.items.length > 0 && cart.restaurant && cart.restaurant.toString() !== food.restaurant.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You can only add items from the same restaurant. Clear your cart first.'
                });
            }

            // Update restaurant reference
            cart.restaurant = food.restaurant;

            // Populate cart items to see if this food already exists in the cart
            const populatedCart = await cart.populate({
                path: 'items',
                populate: { path: 'food' }
            });

            const existingItem = populatedCart.items.find(item => item.food._id.toString() === foodId);

            if (existingItem) {
                existingItem.quantity += qty;
                existingItem.price = food.price * existingItem.quantity;
                await existingItem.save();
            } else {
                const cartItem = await CartItem.create({
                    food: foodId,
                    quantity: qty,
                    addons: addons || [],
                    price: food.price * qty
                });
                cart.items.push(cartItem._id);
            }

            await cart.save();

            res.status(200).json({
                success: true,
                message: 'Item added to cart.',
                cart
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateCartItem(req, res) {
        try {
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            const qty = parseInt(quantity, 10);

            if (qty <= 0) {
                return this.deleteCartItem(req, res);
            }

            const item = await CartItem.findById(cartItemId).populate('food');
            if (!item) {
                return res.status(404).json({ success: false, message: 'Item not found in cart.' });
            }

            item.quantity = qty;
            item.price = item.food.price * qty;
            await item.save();

            res.status(200).json({ success: true, message: 'Cart updated.', item });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteCartItem(req, res) {
        try {
            const { cartItemId } = req.params;

            const cart = await Cart.findOne({ user: req.user._id });
            if (cart) {
                cart.items.pull(cartItemId);
                if (cart.items.length === 0) {
                    cart.restaurant = undefined;
                }
                await cart.save();
            }

            await CartItem.findByIdAndDelete(cartItemId);

            res.status(200).json({ success: true, message: 'Item removed from cart.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            const cart = await Cart.findOne({ user: req.user._id });
            if (cart) {
                // Delete all referenced CartItems
                await CartItem.deleteMany({ _id: { $in: cart.items } });
                cart.items = [];
                cart.restaurant = undefined;
                await cart.save();
            }

            if (req.originalUrl.startsWith('/api/')) {
                return res.status(200).json({ success: true, message: 'Cart cleared.' });
            }
            res.redirect('/cart');
        } catch (error) {
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.redirect('/cart');
        }
    }
}

module.exports = new CartController();
