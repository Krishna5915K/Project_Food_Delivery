const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');

class RestaurantController {
    // Render views
    async getHome(req, res) {
        try {
            const categories = await Category.find({ isActive: true });
            const restaurants = await Restaurant.find({ isApproved: true });
            res.render('home', { 
                title: 'Home', 
                user: req.user, 
                categories, 
                restaurants 
            });
        } catch (error) {
            res.redirect('/restaurants');
        }
    }

    async getRestaurants(req, res) {
        try {
            const search = req.query.search || '';
            const cuisine = req.query.cuisine || '';
            const platform = req.query.platform || '';
            const view = req.query.view || 'restaurants'; // 'restaurants' or 'dishes'

            // Query for Restaurants
            const restaurantQuery = { isApproved: true };
            if (search) {
                restaurantQuery.name = { $regex: search, $options: 'i' };
            }
            if (cuisine) {
                restaurantQuery.cuisineType = cuisine;
            }
            if (platform) {
                restaurantQuery.platform = platform;
            }
            const restaurants = await Restaurant.find(restaurantQuery);

            // Query for Foods (Dishes)
            let foods = [];
            if (view === 'dishes') {
                const foodQuery = { isActive: true };
                
                // Search filter on Food name/description
                if (search) {
                    foodQuery.name = { $regex: search, $options: 'i' };
                }

                // Cuisine category filter
                if (cuisine) {
                    const matchingCategories = await Category.find({ name: { $regex: `^${cuisine}$`, $options: 'i' } });
                    const categoryIds = matchingCategories.map(c => c._id);
                    foodQuery.category = { $in: categoryIds };
                }

                // Platform filter
                if (platform) {
                    const matchingRestaurants = await Restaurant.find({ platform, isApproved: true });
                    const restaurantIds = matchingRestaurants.map(r => r._id);
                    foodQuery.restaurant = { $in: restaurantIds };
                }

                foods = await Food.find(foodQuery).populate('restaurant').populate('category');
            }

            // Get unique cuisines for filter options
            const allCuisinesSet = new Set();
            const allRestaurants = await Restaurant.find({ isApproved: true });
            allRestaurants.forEach(r => {
                if (r.cuisineType) {
                    r.cuisineType.forEach(c => allCuisinesSet.add(c));
                }
            });

            res.render('restaurant-list', { 
                title: 'Restaurants', 
                user: req.user, 
                restaurants,
                foods,
                cuisines: Array.from(allCuisinesSet),
                search,
                selectedCuisine: cuisine,
                selectedPlatform: platform,
                view
            });
        } catch (error) {
            res.redirect('/');
        }
    }

    async getRestaurantDetails(req, res) {
        try {
            const { id } = req.params;
            const restaurant = await Restaurant.findById(id);
            if (!restaurant) {
                return res.status(404).render('error', { title: 'Not Found', message: 'Restaurant not found.', user: req.user });
            }

            const categories = await Category.find({ restaurant: id, isActive: true });
            const foods = await Food.find({ restaurant: id, isActive: true });

            res.render('restaurant-details', { 
                title: restaurant.name, 
                user: req.user, 
                restaurant, 
                categories, 
                foods 
            });
        } catch (error) {
            res.redirect('/restaurants');
        }
    }

    // APIs
    async getAllRestaurantsAPI(req, res) {
        try {
            const query = { isApproved: true };
            if (req.query.search) {
                query.$text = { $search: req.query.search };
            }
            const list = await Restaurant.find(query);
            res.status(200).json({ success: true, count: list.length, data: list });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new RestaurantController();
