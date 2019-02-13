var LocalStrategy   = require('passport-local').Strategy;
var moment = require('moment');
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	passport.use('updateUser', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, username, password, done) {
            findAndUpdateUser = function(){
                // find a user in Mongo with provided username
                // console.log(username);
                User.findOne({ 'username' :  username }, function(err, user) {
                    // In case of any error, return using the done method

                    if (err){
                        console.log('Error in Updating User: '+err);
                        return done(err);
                    }

                    // already exists

                    if (!user) {
                        console.log('User ID does not exist: '+username);
                        return done(null, false, req.flash('message','User ID not found'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();
                        // set the user's local credentials
                        newUser.username   = username.toLowerCase();
                        newUser.password   = password;
                        if (!isSamePassword) {
                            newUser.password   = createHash(password);
                        };
                        newUser.email      = req.body.email;
                        newUser.firstName  = req.body.firstName;
                        newUser.lastName   = req.body.lastName;
                        newUser.lastUpdate = moment().format();
                        newUser._id        = req.params.id;
                        // save the user
                        User.findOneAndUpdate({"_id": req.params.id}, {"username" : newUser.username,
                                                                       "password": newUser.password,
                                                                       "email": newUser.email,
                                                                       "lastUpdate": newUser.lastUpdate,
                                                                       "lastName": newUser.lastName,
                                                                       "firstName": newUser.firstName}
                                                                      , {returnNewDocument: true}
                                                                      , function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Update successful');    
                            return done(null, newUser);
                        });
                    }
                });
            };

            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findAndUpdateUser);
        })

    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

    var isSamePassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };

}