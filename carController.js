const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Car = require('../models/car');
var Station = require('../models/station');
var Fill = require('../models/fill');
var Repair = require('../models/repair');
var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        car_count: function(callback) {
            Car.count(callback);
        },
        station_count: function(callback) {
            Station.count(callback);
        },
        fill_count: function(callback) {
            Fill.count(callback);
        },
        repair_count: function(callback) {
            Repair.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Car Tracker Home', error: err, data: results });
    });
};

// Display list of all cars
exports.car_list = function(req, res, next) {

    Car.find()
      .exec(function (err, list_cars) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('car_list', { title: 'List of Cars', car_list: list_cars });
      });
      
};

// Display detail page for a specific car
exports.car_detail = function(req, res, next) {

    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
              .exec(callback);
        },
        fill: function(callback) {
            Fill.find({'car':req.params.id})
            .populate('station')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.car==null) { // No results.
            var err = new Error('Car not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('car_detail', { title: 'Car Detail', car:  results.car, fills: results.fill });
    });

};

// Display car create form on GET
exports.car_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Car create GET');
    res.render('car_form', {title: 'Add Car'});
};

// Handle car create on POST
exports.car_create_post = [
    // Validate all data.
    body('year').isLength({ min: 1 }).trim().withMessage('Year is required'),
    body('make', 'Manufacturer is required').isLength({ min: 1 }).trim(),
    body('model', 'Model is required').isLength({ min: 1 }).trim(),    
    body('trim', 'Trim is required').isLength({ min: 1 }).trim(),    
    body('vin', 'VIN is required').isLength({ min: 1 }).trim(),            
    // Sanitize (trim and escape) the brand name field.
    sanitizeBody('year').trim().escape(),
    sanitizeBody('make').trim().escape(),
    sanitizeBody('model').trim().escape(),
    sanitizeBody('trim').trim().escape(),
    sanitizeBody('vin').trim().escape(),    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a station object with escaped and trimmed data.
        var car = new Car(
          { year: req.body.year ,
            make: req.body.make ,
            model: req.body.model ,
            trim: req.body.trim ,
            vin: req.body.vin ,
            awd: false
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('car_form', { title: 'Add Car', car: car, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Car with same VIN already exists.
            Car.findOne(
                {'vin': req.body.vin}
                
            )
                .exec( function(err, found_car) {
                     if (err) { return next(err); }

                     if (found_car) {
                         //Car already exists, redirect to its detail page
                         res.redirect(found_car.url);
                     }
                     else {

                         car.save(function (err) {
                           if (err) { return next(err); }
                           //Car saved. Redirect to detail page
                           res.redirect(car.url);
                         });

                     }

                 });
        }
    }
];

// Display car delete form on GET
exports.car_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Car delete GET');
};

// Handle car delete on POST
exports.car_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Car delete POST');
};

// Display car update form on GET
exports.car_update_get = function(req, res, next) {
    Car.findById(req.params.id, function(err, car) {
        if (err) {return next(err);}
        if (car == null) { //No results
            var err = new Error("Car not found - try again");
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('car_form', { title:'Update Car', car: car});
    }
)
};


// Handle car update on POST
exports.car_update_post = [
    // Validate Fields
    body('year').isLength({ min: 1 }).trim().withMessage('Year is required'),
    body('make', 'Manufacturer is required').isLength({ min: 1 }).trim(),
    body('model', 'Model is required').isLength({ min: 1 }).trim(),    
    body('trim', 'Trim is required').isLength({ min: 1 }).trim(),    
    body('vin', 'VIN is required').isLength({ min: 1 }).trim(),            
    // Sanitize fields
    sanitizeBody('year').trim().escape(),
    sanitizeBody('make').trim().escape(),
    sanitizeBody('model').trim().escape(),
    sanitizeBody('trim').trim().escape(),
    sanitizeBody('vin').trim().escape(),    

    // Process after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
    
        //create new station object with old _id
        var car = new Car(
            { year: req.body.year ,
              make: req.body.make ,
              model: req.body.model ,
              trim: req.body.trim ,
              vin: req.body.vin ,
              //awd: false,
              _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('car_form', { title: 'Update Car', car: car, errors: errors.array()});
        return;
        }
        else {
            Car.findByIdAndUpdate(req.params.id, car, {}, function(err, thecar) {
                if (err) {return next(err);}
                res.redirect(thecar.url);
            });
        }
    }
];    