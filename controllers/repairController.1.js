var Repair = require('../models/repair');
var Car = require('../models/car');
var Part = require('../models/part');
var async = require('async');
var moment = require('moment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Repairs
exports.repair_list = function(req, res, next) {

    Repair.find()
      //.sort([['work_date', 'ascending']])
      .sort({'car': -1, 'work_date': -1})
      .populate('car')
      .populate('part')
      .exec(function (err, list_repairs) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('repair_list', { title: 'Repair List', repair_list: list_repairs });
        console.log(results.list_repairs);
      });
  
};

// Display detail page for a specific Repair
exports.repair_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Repair detail');
    async.parallel({
        repair: function(callback) {
            Repair.findById(req.params.id)
              .populate('car')
              .populate('part')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.repair==null) { // No results.
            var err = new Error('Repair not found');
            err.status = 404;
            return next(err);
        }
      // Successful, so render
        res.render('repair_detail', { title: 'Repair Detail', repair: results.repair } );
    });
};

// Display Repair create form on GET
//exports.repair_create_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Repair create GET');
//};
exports.repair_create_get = function(req, res, next) {

    // Get all cars, which we can use for adding to our repair.
    async.parallel({
        cars: function(callback) {
            Car.find(callback);
        },
        parts: function(callback) {
            Part.find(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('repair_form', { title: 'Add Repair Info',cars:results.cars, parts:results.parts });
    });

};

exports.repair_create_post = [
    // Validate fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    body('work_date', 'Work Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    body('amount', 'Cost must not be empty.').isLength({ min: 1 }).trim(),
    body('shop_loc', 'Work Location must not be empty').isLength({ min: 1 }).trim(),
    body('part', 'Select Part from the list').isLength({ min: 1 }).trim(),
    body('purchased_at', 'Purchase location must be selected').isLength({ min: 1 }).trim(),
    // Sanitize fields
    sanitizeBody('repair.*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization
    (req, res, next) => {
        

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data.
        var repair = new Repair(
          { car: req.body.car,
            odoMileage: req.body.odoMileage,
            work_date: moment(req.body.work_date).format(),
            part: req.body.part,
            amount: req.body.amount,
            shop_loc: req.body.shop_loc,
            work_desc: req.body.work_desc,
            purchased_at: req.body.purchased_at
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
                parts: function(callback) {
                    Part.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('repair_form', { title: 'Add Repair Info Failed',cars:results.cars, parts:results.parts, repair: repair, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save Repair instance.
            repair.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to repair history page.
                   //res.redirect(repair.url);
                   //res.send('NOT IMPLEMENTED: Fill detail: ' + repair.url);
                   res.redirect('/tracker/repairs/');
                });
        }
    }
];

// Display Repair delete form on GET
exports.repair_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Repair delete GET');
};

// Handle Repair delete on POST
exports.repair_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Repair delete POST');
};

// Display Repair update form on GET
//exports.repair_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Repair update GET');
//};

exports.repair_update_get = function(req, res, next) {

    // Get Repair and Car details for form.
    async.parallel({
        repair: function(callback) {
            Repair.findById(req.params.id)
            .populate('car')
            .populate('part')
            .exec(callback);
        },
        cars: function(callback) {
            Car.find(callback);
        },
        parts: function(callback) {
            Part.find(callback);
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.repair==null) { // No results.
                var err = new Error('Repair Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('repair_form', { title: 'Update Repair Info', cars:results.cars, parts:results.parts, repair: results.repair });
        });

};


// Handle Repair update on POST
//exports.repair_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Repair update POST');
//};

exports.repair_update_post = [

    // Validate fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    body('work_date', 'Work Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    body('amount', 'Cost must not be empty.').isLength({ min: 1 }).trim(),
    body('shop_loc', 'Work Location must not be empty').isLength({ min: 1 }).trim(),
    body('part', 'Select Part from the list').isLength({ min: 1 }).trim(),
    body('purchased_at', 'Purchase location must be selected').isLength({ min: 1 }).trim(),
    // Sanitize fields
    sanitizeBody('repair.*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data, and old ID.
        var repair = new Repair(
            { car: req.body.car,
              odoMileage: req.body.odoMileage,
              work_date: moment(req.body.work_date).format(),
              part: req.body.part,
              amount: req.body.amount,
              shop_loc: req.body.shop_loc,
              work_desc: req.body.work_desc,
              purchased_at: req.body.purchased_at,
              _id:req.params.id
            });
              
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
                parts: function(callback) {
                    Part.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('repair_form', { title: 'Update Repair Info Failed',cars:results.cars, parts:results.parts, repair: repair, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Repair.findByIdAndUpdate(req.params.id, repair, {}, function (err,therepair) {
                if (err) { return next(err); }
                   // Successful - redirect to fill history page.
                   //res.redirect(therepair.url);
                   res.redirect('/tracker/repairs/');
                });
        }
    }
];
