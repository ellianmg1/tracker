const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var User = require('../models/user');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var passport = require('passport');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
};

var isSamePassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

// GET login page
exports.login_get = function(req, res) {
    //Display the Login page with any flash message, if any
    res.render('login', { title: 'Sign in', message: req.flash('message') });
};

// Handle Login POST
exports.login_post = passport.authenticate('login', {
    successRedirect: '/tracker',
    failureRedirect: '/',
    failureFlash : true
});

// Display Station create form on GET
exports.signup_get = function(req, res) {
    res.render('register',{title: 'Register account', message: req.flash('message')});
};

// Handle Login POST
exports.signup_post = (passport.authenticate('signup', {
    successRedirect: '/tracker',
    failureRedirect: '/signup',
    failureFlash : true
}));

/* Handle Logout */
exports.logout = (function(req, res) {
	req.logout();
	res.redirect('/');
});

/* GET User Detail Page */
exports.user_detail = (isAuthenticated, function(req, res){
	res.render('user_detail', {title: 'Account Details', user: req.user });
});

// /* GET Edit User Details Page */
exports.user_update_get = (isAuthenticated, function(req, res){
	res.render('user_form', { title: 'Update Account', user: req.user });
});

// Handle User Update on POST
exports.user_update_post = [ 
    // Validate Fields
    // body('username').isLength({ min: 1 }).trim().withMessage('Gas Brand is required'),
    // body('zipcode').isLength({ min: 1 }).trim().withMessage('Zip Code is required'),
    // //.isNumeric.withMessage('Zip Code must be numeric, 5-digit'),
    // body('email').isLength({ min: 1 }).trim().withMessage('City name is required'),
    // // body('', 'State is required').isLength({ min: 1 }).trim(),
    // // Sanitize fields
    // sanitizeBody('username').trim().escape(),
    // sanitizeBody('email').trim().escape(),
    // sanitizeBody('firstName').trim().escape(),
    // sanitizeBody('lastName').trim().escape(),

    // Process after validation and sanitization
    (req, res, next) => {
        
        const errors = validationResult(req);

        if (!isSamePassword) {
            //create new station object with old _id
            var user = new User(
                { username: req.body.username.toLowerCase() ,
                password: createHash(req.user.password),
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                lastUpdate: moment().format(),
                _id: req.params.id
                }
            )
            } else{
                var user = new User(
                    { username: req.body.username.toLowerCase() ,
                    password: req.user.password,
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    lastUpdate: moment().format(),
                    _id: req.params.id
                    }
                )
            };

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('user_form', { title: 'Update Account', user: user, errors: errors.array()});
        return;
        }
        else {
            User.findOneAndUpdate({"_id": req.params.id}
                                 ,{"username" : user.username,
                                   "password": user.password,
                                   "email": user.email,
                                   "lastUpdate": user.lastUpdate,
                                   "lastName": user.lastName,
                                   "firstName": user.firstName}
                                , {returnNewDocument: true}
                                , function(err, theuser) {
                if (err) {return next(err);}
                res.redirect(theuser.url);
            });
        }
    }
];

