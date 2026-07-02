const Rating = require('../models/Rating');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

class ReviewController {
    async createReviewAPI(req, res) {
        try {
            const { restaurantId, foodId, rating, comment } = req.body;

            // Save rating
            const newRating = await Rating.create({
                user: req.user._id,
                restaurant: restaurantId || undefined,
                food: foodId || undefined,
                rating: parseInt(rating, 10),
                comment
            });

            // Save legacy review model if needed, or just log
            await Review.create({
                user: req.user._id,
                restaurant: restaurantId || undefined,
                rating: parseInt(rating, 10),
                comment
            });

            // Re-calculate average rating for restaurant
            if (restaurantId) {
                const allRatings = await Rating.find({ restaurant: restaurantId });
                const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
                
                await Restaurant.findByIdAndUpdate(restaurantId, {
                    averageRating: parseFloat(avgRating.toFixed(1)),
                    totalRatings: allRatings.length
                });
            }

            res.status(201).json({
                success: true,
                message: 'Thank you for your rating!',
                data: newRating
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getReviewsAPI(req, res) {
        try {
            const query = {};
            if (req.query.restaurantId) query.restaurant = req.query.restaurantId;
            if (req.query.foodId) query.food = req.query.foodId;

            const reviews = await Rating.find(query).populate('user', 'name profileImage');
            res.status(200).json({ success: true, count: reviews.length, data: reviews });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ReviewController();
