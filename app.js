require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const routes = require('./routes/authRoutes');

const app = express();
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

if(process.env.NODE_ENV != 'production'){
    app.use((req,res,next)=>{
        logger.debug(`${req.method} ${req.url}`);
        next();
    })
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files config
app.use('/css', express.static(path.join(__dirname, 'public', 'styles')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended : true, limit : '25kb'}));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Mount authRoutes for UI views and API requests
app.use('/', routes);
app.use('/api/v1/auth', routes);

const globalLimiter = rateLimit({
    windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS,10),
    max : parseInt(process.env.RATE_LIMIT_MAX,10),
    standardHeaders:true,
    legacyHeaders : false,
    message : {status: 'fail', message : 'Too many requests. Please try again later 👌'}
})
app.use(globalLimiter);

module.exports = app;