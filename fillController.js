var Car = require('../models/car');
var Station = require('../models/station');
var Fill = require('../models/fill');
var moment = require('moment');

var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Fills
exports.fill_list = function(req, res, next) {

    Fill.find()
      .sort({'car': -1, 'fill_date': -1})
      .populate('car')
      .populate('station')
      //.sort({'car._id': -1})
      .exec(function (err, list_fills) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('fill_list', { title: 'Fill History', fill_list: list_fills });
      });
      
};
// Display detail page for a specific Fill
exports.fill_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Fill detail: ' + req.params.id);
};

// Display Fill create form on GET
//exports.fill_create_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill create GET');
//};

exports.fill_create_get = function(req, res, next) {

    // Get all cars and stations, which we can use for adding to our fill.
    async.parallel({
        cars: function(callback) {
            Car.find(callback);
        },
        stations: function(callback) {
            Station.find(callback).sort({'brand': 1, 'zipcode': 1});
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('fill_form', { title: 'Add Fill Info',cars:results.cars, stations:results.stations });
    });

};

// Handle Fill create on POST
//exports.fill_create_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill create POST');
//};

exports.fill_create_post = [
    // Validate fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('fill_date', 'Fill Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    body('price_per_gal', 'Price Per Gallon must not be empty.').isLength({ min: 1 }).trim(),
    body('total_gal', 'Total Gallons must not be empty').isLength({ min: 1 }).trim(),
    body('miles', 'Miles must not be empty').isLength({ min: 1 }).trim(),
    body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    body('station', 'Station must be selected').isLength({ min: 1 }).trim(),
    // Sanitize fields
    sanitizeBody('*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization
    (req, res, next) => {
        

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data.
        var fill = new Fill(
          { car: req.body.car,
            fill_date: moment(req.body.fill_date).format(),
            price_per_gal: req.body.price_per_gal,
            total_gal: req.body.total_gal,
            miles: req.body.miles,
            odoMileage: req.body.odoMileage,
            station: req.body.station
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
                stations: function(callback) {
                    Station.find(callback).sort({'brand': 1, 'zipcode': 1});
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('fill_form', { title: 'Add Fill Info',cars:results.cars, stations:results.stations, fill: fill, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save fill.
            fill.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to fill history page.
                   //res.redirect(fill.url);
                   //res.send('NOT IMPLEMENTED: Fill detail: ' + fill.url);
                   res.redirect('/tracker/fills/');
                });
        }
    }
];

// Display Fill delete form on GET
exports.fill_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Fill delete GET');
};

// Handle Fill delete on POST
exports.fill_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Fill delete POST');
};

// Display Fill update form on GET
//exports.fill_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill update GET');
//};
exports.fill_update_get = function(req, res, next) {

    // Get Fill, Cars and Stations for form.
    async.parallel({
        fill: function(callback) {
            Fill.findById(req.params.id).populate('car').populate('station').exec(callback);
        },
        cars: function(callback) {
            Car.find(callback);
        },
        stations: function(callback) {
            Station.find(callback).sort({'brand': 1, 'zipcode': 1});
        },


        }, function(err, results) {
            if (err) { return next(err); }
            if (results.fill==null) { // No results.
                var err = new Error('Fill Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('fill_form', { title: 'Update Fill Info', cars:results.cars, stations:results.stations, fill: results.fill });
        });

};

// Handle fill update on POST
//exports.fill_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill update POST');
//};
exports.fill_update_post = [

    // Validate fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('fill_date', 'Fill Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    body('price_per_gal', 'Price Per Gallon must not be empty.').isLength({ min: 1 }).trim(),
    body('total_gal', 'Total Gallons must not be empty').isLength({ min: 1 }).trim(),
    body('miles', 'Miles must not be empty').isLength({ min: 1 }).trim(),
    body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    body('station', 'Station must be selected').isLength({ min: 1 }).trim(),
    
    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data, and old ID.
        var fill = new Fill(
            { car: req.body.car,
              fill_date: moment(req.body.fill_date).format(),
              price_per_gal: req.body.price_per_gal,
              total_gal: req.body.total_gal,
              miles: req.body.miles,
              odoMileage: req.body.odoMileage,
              station: req.body.station,
              _id:req.params.id //This is required, or a new ID will be assigned!
             });
          
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
                stations: function(callback) {
                    Station.find(callback).sort({'brand': 1, 'zipcode': 1});
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('fill_form', { title: 'Update Fill Info', cars:results.cars, stations:results.stations, fill: fill, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Fill.findByIdAndUpdate(req.params.id, fill, {}, function (err,thefill) {
                if (err) { return next(err); }
                   // Successful - redirect to fill history page.
                   //res.redirect(thefill.url);
                   res.redirect('/tracker/fills/');
                });
        }
    }
];
