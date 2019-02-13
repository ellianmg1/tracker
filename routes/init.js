var login = require('./login');
var signup = require('./signup');
var updateUser = require('./updateUser');
var User = require('../models/user');
var moment = require('moment');

module.exports = function(passport){
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        // console.log('Date/Time:', moment().format('lll'), '; serializing user: ',user.username);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            // console.log('Date/Time:', moment().format('lll'), '; deserializing user: ', user.username);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
    updateUser(passport);
}