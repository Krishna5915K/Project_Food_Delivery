const Food = require('../models/Food');
const Review = require('../models/Review');
const Rating = require('../models/Rating');

class FoodController {
    // Render view
    async getFoodDetails(req, res) {
        try {
            const { id } = req.params;
            const food = await Food.findById(id).populate('restaurant').populate('category');
            
            if (!food) {
                return res.status(404).render('error', { title: 'Not Found', message: 'Food item not found.', user: req.user });
            }

            // Fetch reviews and ratings
            const ratings = await Rating.find({ food: id }).populate('user');
            
            res.render('food-details', { 
                title: food.name, 
                user: req.user, 
                food, 
                ratings 
            });
        } catch (error) {
            res.redirect('/restaurants');
        }
    }

    // API
    async getFoodAPI(req, res) {
        try {
            const { id } = req.params;
            const food = await Food.findById(id).populate('restaurant');
            if (!food) {
                return res.status(404).json({ success: false, message: 'Food item not found.' });
            }
            res.status(200).json({ success: true, data: food });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new FoodController();
