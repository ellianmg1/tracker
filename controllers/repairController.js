var Repair = require('../models/repair');
var Car = require('../models/car');
var Part = require('../models/part');
var User = require('../models/user');
var Category = require('../models/category');
var async = require('async');
var moment = require('moment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Repairs
exports.repair_list = function(req, res, next) {

    async.parallel({
        car: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },
        repair: function(callback) {
            Repair.find(
                // {$and: [{'car.userid': req.user._id}]}
            )
            .sort({'car': -1, 'work_date': -1, 'category': -1})
            .populate('car')
            .populate('part')
            .exec(callback);
        },

        // cost: function(callback) {
        //     Repair.aggregate(
        //         {$group: { _id: {car: "$car", year: { $year: "$work_date"} }, totalCost: {$sum: "$amount"}, count: { $sum: 1 }}},                                
        //         {$project:{ _id: 1, totalCost: 1, count: 1}})
        //     .sort({_id: -1})
        //     .exec(callback);
        // },
        
    }, function(err, results) {
        if (err) {return next(err);}
        // res.render('repair_list', {title: 'Repair History', car_list: results.car, repair_list: results.repair, cost_list: results.cost});
        res.render('repair_list', {title: 'Repair History', user: req.user, car_list: results.car, repair_list: results.repair});        
        // console.log(results.repair.length);
    });
    
    //Repair.find()
         //.sort([['work_date', 'ascending']])
      //.sort({'car': -1, 'work_date': -1})
      //.populate('car')
      //.populate('part')
      //.exec(function (err, list_repairs) {
        //if (err) { return next(err); }
        //Successful, so render
        //res.render('repair_list', { title: 'Repair List', repair_list: list_repairs });
      //});
  
};

// Display list of all Repairs for selected car
exports.repair_list_car = function(req, res, next) {
    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
            .exec(callback);
        },

        repair: function(callback) {
            Repair.find({ 
                        $and: [{'car':req.params.id}
                            ]
                    }
                )
            .sort({'work_date': -1, 'category': -1, 'amount': -1})
            .populate('car')
            .populate('part')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('repair_list_year', {title: 'Repair History', user: req.user, car: results.car, repair_list: results.repair});
        // console.log(results.fill);
    });
};

exports.repair_car_year = function(req, res, next) {
    const work_year = parseInt(req.params.year);

    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
            .exec(callback);
        },
        repair: function(callback) {
            Repair.find({
                         $and: [{'car':req.params.id}, 
                                {"$expr": { "$eq": [{"$year": "$work_date"},work_year]}} 
                        ]
                }
            )
            .sort({'work_date': -1, 'category': -1, 'amount': -1})
            .populate('car')
            .populate('part')
            .exec(callback);
        },

    }, function(err, results) {
        if (err) {return next(err);}
        res.render('repair_list_year', {title: 'Repair History', user: req.user, car: results.car, repair_list: results.repair, work_year: work_year});
    });
    
};

exports.repair_car_category = function(req, res, next) {
    const req_category = req.params.category;

    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
            .exec(callback);
        },

        repair: function(callback) {
            Repair.find({ 
                        $and: [{'car':req.params.id},
                               {'category':req.params.category}
                            ]
                    }
                )
            .sort({'work_date': -1, 'category': -1, 'amount': -1})
            .populate('car')
            .populate('part')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('repair_list_category', {title: 'Repair History', user: req.user, car: results.car, repair_list: results.repair, work_category: req_category});
        // console.log(results.repair);
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
        res.render('repair_detail', { title: 'Repair Detail', user: req.user, repair: results.repair } );
    });
};

// Display Repair create form on GET
//exports.repair_create_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Repair create GET');
//};
exports.repair_create_get = function(req, res, next) {
    // If Car ID is present in the URL, pass it to the Form
    if (req.params.id) {
        car_id = req.params.id.toString();
    } else {
        car_id = 0;
    };

    // Get all cars, which we can use for adding to our repair.
    async.parallel({
        cars: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },
        parts: function(callback) {
            Part.find()
            .sort({'manuf': 1, 'partNum': 1})            
            .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('repair_form', { title: 'Add Repair Info', user: req.user, cars:results.cars, parts:results.parts, car_id: car_id });
    });

};

exports.repair_create_post = [
    // Validate fields
    body('category', 'A Category must be selected').isLength({ min: 1 }).trim(),
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

        // Create a Repair object with escaped and trimmed data.
        var repair = new Repair(
          { category: req.body.category,
            car: req.body.car,
            odoMileage: req.body.odoMileage,
            work_date: moment(req.body.work_date).format(),
            part: req.body.part,
            amount: parseFloat(req.body.amount),
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
                    Part.find()
                    .sort({'manuf': 1, 'partNum': 1})            
                    .exec(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('repair_form', { title: 'Add Repair Info Failed', user: req.user, cars:results.cars, parts:results.parts, repair: repair, errors: errors.array() });
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
            Car.findOne({"_id": req.body.car})
            .exec(function(err, thecar){
                // If Repair's Odometer reading > Car's current odometer reading, update Car with Repair
                if (thecar && parseInt(req.body.odoMileage) > thecar.currOdo){
                    Car.findOneAndUpdate(
                        {"_id": req.body.car},
                        {"currOdo":parseInt(req.body.odoMileage)},
                        {returnNewDocument: true},
                        function(err, thecar) {
                            if(err){return next(err);}
                        }
                    );
                }
            })
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
            //Part.find(callback);
            Part.find()
            .sort({'manuf': 1, 'partNum': 1})            
            .exec(callback);
        },
        // category: function(callback) {
        //     Category.find(callback);
        // },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.repair==null) { // No results.
                var err = new Error('Repair Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('repair_form', { title: 'Update Repair Info', user: req.user, cars:results.cars, parts:results.parts, repair: results.repair });
            //console.log(results.repair.work_dt_form);
        });

};

exports.repair_update_post = [

    // Validate fields
    body('category', 'A Category must be selected').isLength({ min: 1 }).trim(),
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

        // // Create a Repair object with escaped and trimmed data, and old ID.
        // var repair = new Repair(
        //     { category: req.body.category,
        //       car: req.body.car,
        //       odoMileage: req.body.odoMileage,
        //       work_date: moment(req.body.work_date).format(),
        //       part: req.body.part,
        //       amount: parseFloat(req.body.amount),
        //       shop_loc: req.body.shop_loc,
        //       work_desc: req.body.work_desc,
        //       purchased_at: req.body.purchased_at,
        //       _id:req.params.id
        //     });

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
                res.render('repair_form', { title: 'Update Repair Info Failed', user: req.user, cars:results.cars, parts:results.parts, repair: repair, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            // Repair.findByIdAndUpdate(req.params.id, repair, {}, function (err,therepair) {
            //     if (err) { return next(err); }
            //        // Successful - redirect to Repair history page.
            //        res.redirect(therepair.url);
            //     //    res.redirect('/tracker/repairs/');
            //     });
            Repair.findOneAndUpdate({"_id": req.params.id},
                                    {"category":req.body.category,
                                    "car": req.body.car,
                                    "odoMileage": req.body.odoMileage,
                                    "work_date": moment(req.body.work_date).format(),
                                    "part": req.body.part,
                                    "amount": parseFloat(req.body.amount),
                                    "shop_loc": req.body.shop_loc,
                                    "work_desc": req.body.work_desc,
                                    "purchased_at": req.body.purchased_at},
                                    {returnNewDocument: true},
                                    function(err, therepair){
                                        if (err) { return next(err); }
                                        // Successful - redirect to Repair history page.
                                        res.redirect(therepair.url);
                                    }
            );
            Car.findOne({"_id": req.body.car})
            .exec(function(err, thecar){
                // If Repair's Odometer reading > Car's current odometer reading, update Car with Repair
                if (thecar && parseInt(req.body.odoMileage) > thecar.currOdo){
                    Car.findOneAndUpdate(
                        {"_id": req.body.car},
                        {"currOdo":parseInt(req.body.odoMileage)},
                        {returnNewDocument: true},
                        function(err, thecar) {
                            if(err){return next(err);}
                        }
                    );
                }
            })
        }
    }
];
