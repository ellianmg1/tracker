var express = require('express');
var router = express.Router();
var User = require('../models/user');
var signin_controller = require('../controllers/signinController');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

router.get('/', signin_controller.login_get);
router.post('/login', signin_controller.login_post);
router.get('/signup', signin_controller.signup_get);
router.post('/signup', signin_controller.signup_post);
router.get('/user/:id', isAuthenticated, signin_controller.user_detail);
router.get('/user/:id/update', isAuthenticated, signin_controller.user_update_get);
router.post('/user/:id/update', signin_controller.user_update_post);
router.get('/signout', signin_controller.logout);

// module.exports = router;
module.exports = function(passport) {
    return router;
}