const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const db = require('./config/db');

const index = require('./routes/index');
const user = require('./routes/user');
const images = require('./routes/images');
const gallery = require('./routes/gallery');

const app = express();

// database connection
mongoose.connect(db.database, {
    useMongoClient: true
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
app.use('/public/uploads', express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', user);
app.use('/images', images);
app.use('/gallery', gallery);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            error: {}
        }
    });
});

module.exports = app;