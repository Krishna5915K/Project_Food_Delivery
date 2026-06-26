require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');

app.use(errorHandler);

const startServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
        connectDB().catch(err => {
            logger.error(`Database connection failed: ${err.message}`);
        });
    } else {
        await connectDB();
    }
    
    const PORT = parseInt(process.env.PORT, 10) || 555;
    const server = app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
}

startServer();