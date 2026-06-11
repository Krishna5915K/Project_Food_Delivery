require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const startServer = async () => {
    await connectDB();
    const server = app.listen(process.env.PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode`);
    })
}

startServer()