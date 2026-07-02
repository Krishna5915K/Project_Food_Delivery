const Category = require('../models/Category');

class CategoryController {
    async getCategories(req, res) {
        try {
            const categories = await Category.find({ restaurant: req.query.restaurantId });
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            const { name, restaurant, description, image } = req.body;
            const category = await Category.create({ name, restaurant, description, image });
            res.status(201).json({ success: true, message: 'Category created.', data: category });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({ success: true, message: 'Category updated.', data: category });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await Category.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Category deleted.' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CategoryController();
