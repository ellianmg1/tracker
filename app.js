require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var helmet = require('helmet');
var compression = require('compression')
// Code to store log in file, instead of showing in console
var fs = require('fs-extra');
var rfs = require('rotating-file-stream');
//
var cookieParser = require('cookie-parser');
var connect = require('connect');

var app = express();
app.use(helmet());
app.use(compression());
//- this makes 'moment' available to pug
app.locals.moment = require('moment');

//Set up mongoose connection
var mongoose = require('mongoose');

// For connection to Ubuntu Server
// mongoose.connect(process.env.mongoDB, {useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});

// For connection to Atlas on Azure
mongoose.connect(process.env.mongoURI, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Code to store log in file, instead of showing in console
// Logging with daily log file
var logDirectory = path.join(__dirname, 'log')
 
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
 
// create a rotating write stream
var accessLogStream = rfs('tracker.log', {
  interval: '7d', // rotate daily
  path: logDirectory
})

// app.use(logger('dev'));
// app.use(logger('combined'));
// app.use(logger('combined',{stream: accessLogStream}));
// app.use(logger('common',{stream: accessLogStream}));
app.use(logger(':remote-addr :remote-user [:date[iso]] ":method :url" :status :res[content-length] :response-time ms',{stream: accessLogStream}));
// End of logging code

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
app.use(expressSession({secret: 'mySecretKey', 
                        resave: false, 
             saveUninitialized: true}));
            
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./routes/init');
initPassport(passport);

// var index = require('./routes/index');
// var users = require('./routes/users');
var index = require('./routes/index2')(passport);
var tracker = require('./routes/tracker')(passport);
var fintra = require('./routes/fintra')(passport);
var compression = require('compression');
const user = require('./models/user');
app.use(compression()); //Compress all routes

app.use('/', index);
// app.use('/users', users);
app.use('/tracker', tracker);
app.use('/fintra', fintra);
// console.log(app.get('env'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.render('error', {
      message: err.message,
      error: err
  });
});

module.exports = app;
