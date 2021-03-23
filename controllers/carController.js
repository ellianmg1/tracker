const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var mongoose = require('mongoose');
// var fs = require('fs-extra');
var moment = require('moment');
var Car = require('../models/car');
var Station = require('../models/station');
var Fill = require('../models/fill');
var Repair = require('../models/repair');
var Part = require('../models/part');
var User = require('../models/user');
var async = require('async');

exports.car_main = function(req, res) {   
    async.parallel({
        car_list: function(callback) {
            Car.find({'userid':req.user._id})
            .sort({'status': 1})
            .exec(callback);
        },
        // repairTot: function(callback) {
        //     Repair.aggregate(
        //         {$group: { _id: {year: {$substr: ["$work_date",0,4]}}, totalCost: {$sum: "$amount"}}},
        //         {$project:{ _id: 1, totalCost: 1}})
        //     .exec(callback);
        // },
        
    }, function(err, results) {
        res.render('car_main', { title: 'Car Tracker Home', user: req.user, error: err, car_list: results.car_list});
        // res.render('index', { title: 'Car Tracker Home', error: err, data: results, cost: results.repairTot });
        // console.log(results);
    });
};

// Display list of all cars
exports.car_list = function(req, res, next) {
    // console.log(req.user);
    Car.find({'userid':req.user._id})
      .exec(function (err, list_cars) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('car_list', { title: 'All Cars', user: req.user, car_list: list_cars });
      });
      
};

// Display detail page for a specific car
exports.car_detail = function(req, res, next) {

    async.parallel({
        car_list: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },

        car: function(callback) {
            Car.findById(req.params.id)
              .exec(callback);
        },
        
        last_fill: function(callback) {
            Fill.find({'car':req.params.id})
              .sort({'odoMileage': -1})
              .limit(1)
              .exec(callback);
        },
        lastYr_fill: function(callback) {
            Fill.aggregate([
                {$match: {car: mongoose.Types.ObjectId(req.params.id)}},
                {$group: { _id: {car: "$car", year: { $year: "$fill_date"} }, 
                     lastFillDt: {$max: "$fill_date"},
                    }
                },                                
                {$project:{ _id: 0, lastFillDt: 1}}
            ])
            .sort({'lastFillDt': -1})
            .limit(2)
            .exec(callback);
        },

        mpg: function(callback) {
            Fill.aggregate([
                {$match: {car: mongoose.Types.ObjectId(req.params.id)}},
                {$group: { _id: {car: "$car"}, 
                         maxOdo: {$max: "$odoMileage"}, 
                         totMiles: {$sum: "$miles"}, 
                         totalGal: {$sum: "$total_gal"} 
                    }
                },                                
                {$project:{ _id: 0, maxOdo: 1, totMiles: 1, totalGal: 1 } }
            ])
            .exec(callback);
        },
        
        fill_summary: function(callback) {
            Fill.aggregate([
                {$match: {car: mongoose.Types.ObjectId(req.params.id)}},
                {$group: { _id: {car: "$car", year: { $year: "$fill_date"} }, 
                     totalCost: {$sum: {$multiply: ["$price_per_gal", "$total_gal"]}}, 
                     totalMiles: {$sum: "$miles"}, 
                     totalGal: {$sum: "$total_gal"}, 
                     lastFillDt: {$max: "$fill_date"},
                     count: { $sum: 1 }
                    }
                },                                
                {$project:{ _id: 1, totalCost: 1, totalMiles: 1, totalGal: 1, lastFillDt: 1, count: 1}}
            ])
            .sort({_id: -1})
            .exec(callback);
        },

        // Repair Summary by Year
        repair_summary: function(callback) {
            Repair.aggregate([
                {$match: {car: mongoose.Types.ObjectId(req.params.id)}},                
                {$group: { _id: {car: "$car", year: { $year: "$work_date"} }, 
                     totalCost: {$sum: "$amount"}, 
                     count: { $sum: 1 }
                    }
                },                                
                {$project:{ _id: 1, totalCost: 1, count: 1}}])
            .sort({_id: -1})
            .exec(callback);
        },

        // Repair Summary by Category
        repair_summ_by_cat: function(callback) {
            Repair.aggregate([
                {$match: {car: mongoose.Types.ObjectId(req.params.id)}},                
                {$group: { _id: {car: "$car", category: "$category"}, 
                     totalCost: {$sum: "$amount"}, 
                     count: { $sum: 1 }
                    }
                },                                
                {$project:{ _id: 1, totalCost: 1, count: 1}}])
            .sort({totalCost: -1, _id: -1})
            .exec(callback);
        },
        // Last Repair Instance by Category
        last_summary: function(callback) {
            Repair.aggregate(
                [{$match: {car: mongoose.Types.ObjectId(req.params.id), odoMileage: {$ne: 0}}},
                 {$group: {_id: {car: "$car", 
                            category: "$category"}, 
                         maxWorkDate: {$max: "$work_date"}, 
                          maxMileage: {$max: "$odoMileage"}}}
                ]
            )
            .sort({category: -1, maxWorkDate: -1})
            .exec(callback);
        },

        part_list: function(callback) {
            Part.find({'car': req.params.id})
            .exec(callback);
        }
    }, function(err, results) {

        // Calculate overall MPG and pass.
        if (results.mpg.length) {
            if (results.car.startOdo = 0) {
                car_mpg = (results.mpg[0].maxOdo / results.mpg[0].totalGal).toFixed(2);
            } else {
                car_mpg = (results.mpg[0].totMiles / results.mpg[0].totalGal).toFixed(2);
            }
        } else {
            car_mpg = 0;
        }
        // Calculate overall Repair Total, including future parts bought.
        if (results.repair_summary.length) {
            repair_tot = 0;
            arrLen = results.repair_summary.length;
            for (var i = 0; i < arrLen; i++) {
                repair_tot += results.repair_summary[i].totalCost;
                // console.log(repair_tot)
            }
        }   else {
            repair_tot = 0;
        }

        if (err) { return next(err); }
        if (results.car==null) { // No results.
            var err = new Error('Car not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('car_detail', { title: 'Car Detail', car: results.car, repair_summ: results.repair_summary, 
                        fill_summ: results.fill_summary, last_summ: results.last_summary, lastFill: results.last_fill, 
                        prevYrLastFill: results.lastYr_fill[1], repair_summ_by_cat: results.repair_summ_by_cat, 
                        car_mpg: car_mpg, repair_tot: repair_tot, user: req.user, car_list: results.car_list,
                        part_list: results.part_list
        });
        // console.log(results.car);
        // console.log(results.repair_summ_by_cat)

        // res.render('car_detail', { title: 'Car Detail', car: results.car, fills: results.fill, 
        //                            parts: results.part, repairs: results.repair, fill_summ: results.fill_summary});
        // res.render('car_detail', { title: 'Car Detail', car: results.car, parts: results.part, 
        //                      repair_summ: results.repair_summary, fill_summ: results.fill_summary, 
        //                        last_summ: results.last_summary});        
    });

};

// Display car create form on GET
exports.car_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Car create GET');
    // res.render('car_form', {title: 'Add Car', user: req.user});
    async.parallel({
        car_list: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },
    }, function(err, results) {
        res.render('car_form', {title: 'Add Car', user: req.user, car_list: results.car_list});
    });

};

// Handle car create on POST
exports.car_create_post = [
    // Validate all data.
    body('year').isLength({ min: 1 }).trim().withMessage('Year is required'),
    body('make', 'Manufacturer is required').isLength({ min: 1 }).trim(),
    body('model', 'Model is required').isLength({ min: 1 }).trim(),    
    body('trim', 'Trim is required').isLength({ min: 1 }).trim(),    
    body('status', 'Select status').isLength({ min: 1 }).trim(),    
    body('purchase_dt').isLength({ min: 1 }).trim().isISO8601(),
    body('vin', 'VIN is required').isLength({ min: 1 }).trim(),            
    // Sanitize (trim and escape) the brand name field.
    sanitizeBody('year').trim().escape(),
    sanitizeBody('make').trim().escape(),
    sanitizeBody('model').trim().escape(),
    sanitizeBody('trim').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('purchase_dt').trim().escape(),
    sanitizeBody('vin').trim().escape(),
    sanitizeBody('startOdo').trim().escape(),    
    sanitizeBody('currOdo').trim().escape(),    
    sanitizeBody('price').trim().escape(),    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!req.body.awd) {
            var awd = "no";
        } else {
            var awd = req.body.awd;
        };

        // Create a station object with escaped and trimmed data.
        var car = new Car(
          { year: req.body.year ,
            make: req.body.make ,
            model: req.body.model ,
            trim: req.body.trim ,
            status: req.body.status ,
            purchase_dt: moment(req.body.purchase_dt).format(),     
            vin: req.body.vin,
            currOdo: req.body.currOdo,
            startOdo: req.body.startOdo,
            color: req.body.color ,
            userid: req.user._id,
            price: req.body.price,
            awd: awd
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

    async.parallel({
        car_list: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },

        car: function(callback) {
            Car.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.car == null) { //No results
            var err = new Error("Car not found - try again");
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('car_form', { title:'Update Car', user: req.user, car: results.car, car_list: results.car_list});

    }); 
    // Car.findById(req.params.id, function(err, car) {
    //     if (err) {return next(err);}
    //     if (car == null) { //No results
    //         var err = new Error("Car not found - try again");
    //         err.status = 404;
    //         return next(err);
    //     }
        // Success
        // res.render('car_form', { title:'Update Car', user: req.user, car: car});
        // console.log(car.awd);
    // })
};


// Handle car update on POST
exports.car_update_post = [
    // Validate Fields
    body('year').isLength({ min: 1 }).trim().withMessage('Year is required'),
    body('make', 'Manufacturer is required').isLength({ min: 1 }).trim(),
    body('model', 'Model is required').isLength({ min: 1 }).trim(),    
    body('trim', 'Trim is required').isLength({ min: 1 }).trim(),   
    body('status', 'Select status').isLength({ min: 1 }).trim(),  
    body('purchase_dt').isLength({ min: 1 }).trim().isISO8601(),           
    body('vin', 'VIN is required').isLength({ min: 1 }).trim(),
    // body('awd').isLength(),

    // Sanitize fields
    sanitizeBody('year').trim().escape(),
    sanitizeBody('make').trim().escape(),
    sanitizeBody('model').trim().escape(),
    sanitizeBody('trim').trim().escape(),
    sanitizeBody('status').trim().escape(),    
    sanitizeBody('purchase_dt').trim().escape(),    
    sanitizeBody('vin').trim().escape(),    
    sanitizeBody('startOdo').trim().escape(),    
    sanitizeBody('currOdo').trim().escape(),
    sanitizeBody('awd').trim().escape(),
    sanitizeBody('price').trim().escape(),    
    // Process after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);

        if (!req.body.awd) {
            var awd = "no";
        } else {
            var awd = req.body.awd;
        };
        // console.log(awd);
        //create new car object with old _id
        var car = new Car(
            { year: req.body.year ,
              make: req.body.make ,
              model: req.body.model ,
              trim: req.body.trim ,
              status: req.body.status ,
              purchase_dt: moment(req.body.purchase_dt).format(),
              vin: req.body.vin ,
              currOdo: req.body.currOdo,
              startOdo: req.body.startOdo,
              color: req.body.color ,
              userid: req.body.userid,
              price: req.body.price,
              awd: awd,
              path: (req.body.imgNm.length ? req.body.imgNm : req.body.imgNmCurr),
              _id: req.params.id
            }
        );
        // console.log(car);
        
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