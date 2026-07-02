require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');

app.use(errorHandler);

const Restaurant = require('./models/Restaurant');
const Food = require('./models/Food');
const seedData = require('./utils/seeder');

const autoSeed = async () => {
    try {
        const foodCount = await Food.countDocuments();
        const restaurantCount = await Restaurant.countDocuments();
        const hasOldPlatform = await Restaurant.exists({ platform: 'FoodClone' });
        if (foodCount < 50 || restaurantCount === 0 || hasOldPlatform) {
            logger.info('Database has insufficient or outdated data. Automatically seeding 160 Swiggy & Zomato items...');
            await seedData(false);
        }
    } catch (err) {
        logger.error(`Auto-seeding check failed: ${err.message}`);
    }
};

const startServer = async () => {
    try {
        await connectDB();
        await autoSeed();
    } catch (err) {
        logger.error(`Database connection failed: ${err.message}`);
    }
    
    const PORT = parseInt(process.env.PORT, 10) || 555;
    const server = app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
}

startServer();