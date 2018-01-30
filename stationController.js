//import { Error } from 'mongoose';

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Station = require('../models/station');
var async = require('async');

// Display list of all Stations
exports.station_list = function(req, res, next) {

    Station.find()
      .sort({'brand': 1, 'zipcode': 1})
      .exec(function (err, list_stations) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('station_list', { title: 'Station List', station_list: list_stations });
      });
  
};

// Display detail page for a specific Station
exports.station_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Station detail: ' + req.params.id);
//};

    async.parallel({
        station: function(callback) {
            Station.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.station==null) { // No results.
            var err = new Error('Station not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('station_detail', { title: 'Station Detail', station:  results.station });
    });

};


// Display Station create form on GET
exports.station_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Station create GET');
    res.render('station_form', {title: 'Add Station'});
};

// Handle Station create on POST
//exports.station_create_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: Station create POST');
//};

exports.station_create_post =  [
   
    // Validate that the brand name field is not empty.
    body('brand', 'Gas Brand is required').isLength({ min: 1 }).trim(),
    body('zipcode', 'Zip Code is required').isLength({ min: 1 }).trim(),
    body('city', 'City is required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the brand name field.
    sanitizeBody('brand').trim().escape(),
    sanitizeBody('zipcode').trim().escape(),
    sanitizeBody('city').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a station object with escaped and trimmed data.
        var station = new Station(
          { brand: req.body.brand ,
            zipcode: req.body.zipcode ,
            city: req.body.city
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('station_form', { title: 'Add Station', station: station, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Station with same zipcode already exists.
            Station.findOne(
                { $and: [
                    {'zipcode': req.body.zipcode},
                    {'brand': req.body.brand}
                        ]
                }
            )
                .exec( function(err, found_station) {
                     if (err) { return next(err); }

                     if (found_station) {
                         //Station exists, redirect to its detail page
                         res.redirect(found_station.url);
                     }
                     else {

                         station.save(function (err) {
                           if (err) { return next(err); }
                           //station saved. Redirect to station detail page
                           res.redirect(station.url);
                         });

                     }

                 });
        }
    }
];

// Display Station delete form on GET
exports.station_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Station delete GET');
};

// Handle Station delete on POST
exports.station_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Station delete POST');
};

// Display Station update form on GET
exports.station_update_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Station update GET');
    Station.findById(req.params.id, function(err, station) {
        if (err) {return next(err);}
        if (station == null) { //No results
            var err = new Error("Station not found - try again");
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('station_form', { title:'Update Station', station: station});
    }
)
};

// Handle Station update on POST
//exports.station_update_post = function(req, res, next) {}

exports.station_update_post = [ 
    //function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Station update POST');
    // Validate Fields
    body('brand').isLength({ min: 1 }).trim().withMessage('Gas Brand is required'),
    body('zipcode').isLength({ min: 1 }).trim().withMessage('Zip Code is required'),
    //.isNumeric.withMessage('Zip Code must be numeric, 5-digit'),
    body('city').isLength({ min: 1 }).trim().withMessage('City name is required'),
    // Sanitize fields
    sanitizeBody('brand').trim().escape(),
    sanitizeBody('zipcode').trim().escape(),
    sanitizeBody('city').trim().escape(),

    // Process after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
    
        //create new station object with old _id
        var station = new Station(
            { brand: req.body.brand ,
              zipcode: req.body.zipcode ,
              city: req.body.city,
              _id: req.params.id
            
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('station_form', { title: 'Update Station', station: station, errors: errors.array()});
        return;
        }
        else {
            Station.findByIdAndUpdate(req.params.id, station, {}, function(err, thestation) {
                if (err) {return next(err);}
                res.redirect(thestation.url);
            });
        }
    }
];