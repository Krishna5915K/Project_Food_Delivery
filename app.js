require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const errorHandler = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files config
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/css', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(express.json());
app.use(express.urlencoded({extended : true, limit : '25kb'}));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Mount routes
app.use('/', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/', adminRoutes);
app.use('/', ownerRoutes);
app.use('/', deliveryRoutes);
app.use('/', customerRoutes);

const globalLimiter = rateLimit({
    windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS,10),
    max : parseInt(process.env.RATE_LIMIT_MAX,10),
    standardHeaders:true,
    legacyHeaders : false,
    message : {status: 'fail', message : 'Too many requests. Please try again later 👌'}
})
app.use(globalLimiter);

module.exports = app;