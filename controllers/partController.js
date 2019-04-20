var Part = require('../models/part');
var Car = require('../models/car');
var User = require('../models/user');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Parts
exports.part_list = function(req, res, next) {

    async.parallel({
        car: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },

        part: function(callback){
            Part.find(
                // {$and: [{'car.userid': req.user._id}]}
            )
            //.sort({'car': -1, 'manuf': -1, 'partNum': 1})
            .sort({'manuf': 1, 'partNum': 1})            
            .populate('car')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('part_list', { title: 'Parts List', user: req.user, car_list: results.car, part_list: results.part});
    });

    //Part.find()
      //.sort({'car': -1})
      //.populate('car')
      //.exec(function (err, list_parts) {
        //if (err) { return next(err); }
        //Successful, so render
        //res.render('part_list', { title: 'Parts List', part_list: list_parts });
      //});
  
};

// Display detail page for a specific Part
exports.part_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Part detail');
    async.parallel({
        part: function(callback) {
            Part.findById(req.params.id)
              .populate('car')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.part==null) { // No results.
            var err = new Error('Part not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('part_detail', { title: 'Part Detail', user: req.user, part: results.part } );
    });

};

// Display Part create form on GET
exports.part_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Part create GET');
    // Get all cars, which we can use for adding to our part.
    async.parallel({
        cars: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('part_form', { title: 'Add Part Details', user: req.user, car_list:results.cars });
    });

};

// Handle Part create on POST
//exports.part_create_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Part create POST');
//};

exports.part_create_post = [
    // Validate fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('partNum', 'Part number must be entered.').isLength({ min: 1 }).trim(),
    body('s_name', 'Part name is missing.').isLength({ min: 1 }).trim(),
    body('desc', 'Part description is missing.').isLength({ min: 1 }).trim(),
    body('manuf', 'Part Manufacturer is missing.').isLength({ min: 1 }).trim(),    
    // Sanitize fields
    sanitizeBody('*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Part object with escaped and trimmed data.
        var part = new Part(
          { car: req.body.car,
            partNum: req.body.partNum,
            s_name: req.body.s_name,
            desc: req.body.desc,
            qty_avl: req.body.qty_avl,
            notes: req.body.notes,
            manuf: req.body.manuf
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('part_form', { title: 'Add Part Details', user: req.user, cars:results.cars, part: part, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. 
            // Check if Part already exists for the car. 
            Part.findOne(
                { $and: [
                    {'part_num': req.body.partNum},
                    {'car': req.body.car}

                ]
                }
            )
            .exec( function(err, found_part) {
                if (err) { return next(err); }

                if (found_part) {
                    //Part already exists, redirect 
                    res.redirect(found_part.url);
                }
                
                else {
                    // Part not found, save Part
                    part.save(function (err) {
                        if (err) { return next(err); }
                           //successful - redirect to Parts List page.
                           //res.redirect(part.url);
                           //res.send('NOT IMPLEMENTED: Part detail: ' + part.url);
                           res.redirect('/tracker/parts/');
                        });
        
                }
            });
        }
    }
];


// Display Part delete form on GET
exports.part_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Part delete GET');
};

// Handle Part delete on POST
exports.part_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Part delete POST');
};

// Display Part update form on GET
//exports.part_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Part update GET');
//};

exports.part_update_get = function(req, res, next) {

    // Get part and car details for form.
    async.parallel({
        part: function(callback) {
            Part.findById(req.params.id)
            .populate('car')
            .exec(callback);
        },
        cars: function(callback) {
            Car.find(callback);
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.part==null) { // No results.
                var err = new Error('Part Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('part_form', { title: 'Update Part Info', user: req.user, car_list:results.cars, part: results.part });
        });

};


// Handle Part update on POST
//exports.part_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Part update POST');
//};

exports.part_update_post = [

    // Validate required fields
    body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    body('partNum', 'Part number must be entered.').isLength({ min: 1 }).trim(),
    body('s_name', 'Part name is missing.').isLength({ min: 1 }).trim(),
    body('desc', 'Part description is missing.').isLength({ min: 1 }).trim(),
    body('manuf', 'Part Manufacturer is missing.').isLength({ min: 1 }).trim(),        
    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data, and old ID.
        var part = new Part(
            { car: req.body.car,
              partNum: req.body.partNum,
              s_name: req.body.s_name,
              desc: req.body.desc,
              qty_avl: req.body.qty_avl,
              notes: req.body.notes,
              manuf: req.body.manuf,
              _id: req.params.id //This is required, or a new ID will be assigned!
            });
              
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                cars: function(callback) {
                    Car.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('part_form', { title: 'Update Part Info', user: req.user, cars:results.cars, part: Part, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Part.findByIdAndUpdate(req.params.id, part, {}, function (err,thepart) {
                if (err) { return next(err); }
                   // Successful - redirect to Part List page.
                   //res.redirect(thepart.url);
                   res.redirect('/tracker/parts/');
                });
        }
    }
];
