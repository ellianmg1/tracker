var express = require('express');
var router = express.Router();
var User = require('../models/user');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
};

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login', { title: 'Sign in', message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/tracker',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register', {title: 'Register account', message: req.flash('message')});
	});

	// /* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/tracker',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET User Detail Page */
	router.get('/user/:id', isAuthenticated, function(req, res){
		res.render('user_detail', {title: 'Account Details', user: req.user });
		// res.redirect('/tracker');				
	});

	// /* GET Edit User Details Page */
	router.get('/user/:id/update', isAuthenticated, function(req, res){
		// console.log(req.user);
		res.render('user_form', { title: 'Update Account', user: req.user });
	});

	/* POST Edit User Details Page */
	router.post('/user/:id/update', passport.authenticate('updateUser', {
		successRedirect: '/tracker',
		failureRedirect: '/',
		failureFlash : true  
	}));
	
	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}