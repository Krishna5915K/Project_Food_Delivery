const mongoose = require('mongoose')
const logger = require('../utils/logger');


const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.DATABASE_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,

            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,

            heartbeatFrequencyMS: 10000,
            autoIndex: false,
        });

        logger.info(`MongoDB Connected Successfully ${connect.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.warn(`MongoDB Connection error: ${err.message}`)
        })

        mongoose.connection.on('disconnected', () => {
            logger.error(`MongoDB disconnected. Attempting restart 🤦‍♂️`);
        })

        mongoose.connection.on("reconnected", () => {
            logger.info(" MongoDB reconnected 🔄");
        });

        mongoose.connection.on("close", () => {
            logger.warn(" MongoDB connection closed 🔒");
        });

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            logger.warn('Running in development mode without MongoDB. Some DB features will be unavailable.');
        }
    }
}
module.exports = connectDB;