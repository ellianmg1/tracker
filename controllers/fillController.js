var Car = require('../models/car');
var Fill = require('../models/fill');
var User = require('../models/user');
var Station = require('../models/station');
var moment = require('moment');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Fills
exports.fill_list = function(req, res, next) {
    // console.log(req.user._id);
    async.parallel({
        car: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },

        fill: function(callback) {
            Fill.find(
                // {'car.userid':req.user._id}
            )
            .sort({'car': -1, 'fill_date': -1, 'odoMileage': -1})
            .populate('car')
            .populate('station')
            .exec(callback);
        },
        // fill_summary: function(callback) {
        //     Fill.aggregate(
        //         {$group: { _id: {car: "$car", year: { $year: "$fill_date"} }, 
        //              totalCost: {$sum: {$multiply: ["$price_per_gal", "$total_gal"]}}, 
        //              totalMiles: {$sum: "$miles"}, 
        //              totalGal: {$sum: "$total_gal"}, 
        //              count: { $sum: 1 }
        //             }
        //         },                                
        //         {$project:{ _id: 1, totalCost: 1, totalMiles: 1, totalGal: 1, count: 1}})
        //     .sort({_id: 1})
        //     .exec(callback);
        // },
       
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('fill_list', {title: 'Fill History', user: req.user, car_list: results.car, fill_list: results.fill});
        // res.render('fill_list', {title: 'Fill History', user: req.user, car_list: results.car, fill_list: results.fill, fill_summ: results.fill_summary});
        // console.log(results.fill);
        // console.log(results.car);
    });


    //Fill.find()
      //.sort({'car': -1, 'fill_date': -1})
      //.populate('car')
      //.populate('station')
      //.sort({'car._id': -1})
      //.exec(function (err, list_fills) {
        //if (err) { return next(err); }
        // Successful, so render
        //res.render('fill_list', { title: 'Fill History', fill_list: list_fills });
      //});
      
};

// Display list of all Fills for selected car
exports.fill_list_car = function(req, res, next) {
    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
            .exec(callback);
        },

        fill: function(callback) {
            Fill.find({ 
                        $and: [{'car':req.params.id}, 
                            //    {"$expr": { "$eq": [{"$year": "$fill_date"},fill_year]}} 
                            ]
                    }
                )
            .sort({'fill_date': -1, 'odoMileage': -1})
            .populate('car')
            .populate('station')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('fill_list_year', {title: 'Fill History', user: req.user, car: results.car, fill_list: results.fill});
        // console.log(results.fill);
    });
};


// Display list of all Fills for selected car and year
exports.fill_car_year = function(req, res, next) {
    // chart_dps = [];
    const fill_year = parseInt(req.params.year);
    // console.log(fill_year);
    
    async.parallel({
        car: function(callback) {
            Car.findById(req.params.id)
            .exec(callback);
        },

        fill: function(callback) {
            Fill.find({ 
                        $and: [{'car':req.params.id}, 
                               {"$expr": { "$eq": [{"$year": "$fill_date"},fill_year]}} 
                            ]
                    }
                )
            .sort({'fill_date': -1, 'odoMileage': -1})
            .populate('car')
            .populate('station')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        // for (i = 0; i < results.fill.length; i++) {
        //     chart_dps.fill();
        // };
        res.render('fill_list_year', {title: 'Fill History', user: req.user, car: results.car, fill_list: results.fill, fill_year: fill_year});
        // console.log(results.fill);
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
    // console.log(req.user._id);
    // If Car ID is present in the URL, pass it to the Form
    if (req.params.id) {
        car_id = req.params.id.toString();
    } else {
        car_id = 0;
    };
    // Get all cars and stations, which we can use for adding to our fill.
    async.parallel({
        car: function(callback) {
            Car.find({'userid':req.user._id})
            .exec(callback);
        },
        stations: function(callback) {
            Station.find()
            .sort({'brand': 1, 'state': 1, 'zipcode': 1})
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('fill_form', { title: 'Add Fill Info',user: req.user, cars:results.car, stations:results.stations
                               , car_id: car_id, sourceURL: encodeURIComponent(req.headers.referer) });
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
    // Process request after validation and sanitization
    (req, res, next) => {
        
        // Extract the validation errors from a request 
        const errors = validationResult(req);
        carId = req.body.car;
        sourceURL = decodeURIComponent(req.body.sourceURL);
        var forecast = 0;
        // Create a Fill object with escaped and trimmed data.
        var fill = new Fill(
          { car: req.body.car,
            fill_date: moment(req.body.fill_date).format(),
            price_per_gal: parseFloat(req.body.price_per_gal),
            total_gal: parseFloat(req.body.total_gal),
            miles: parseFloat(req.body.miles),
            odoMileage: parseInt(req.body.odoMileage),
            station: req.body.station,
            createTS: moment().format(),
            updateTS: moment().format(),
            forecast: forecast,
           });

        var car = new Car(
          { currOdo: parseInt(req.body.odoMileage),
            _id: req.body.car,
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
                res.render('fill_form', { title: 'Add Fill Info', user: req.user, cars:results.cars, stations:results.stations
                                        , car_id: car_id, sourceURL: encodeURIComponent(req.headers.referer), fill: fill, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save fill.
            fill.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to fill history page.
                   //res.redirect(fill.url);

                   if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                   } else {
                    res.redirect('/tracker/fills/');
                   }
                });

            Car.findByIdAndUpdate(carId, car, {}, function (err,thecar) {
               if (err) { return next(err); }
               });
        }
    }
];

// Display Fill delete form on GET
exports.fill_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Fill delete GET');
    async.parallel({
        fill: function (callback) {
            Fill.findById(req.params.id).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.fill == null) { // No results.
            res.redirect('/tracker/fills');
        }
        // Successful, so render.
        res.render('fill_delete', { title: 'Delete Fill', user: req.user, fill: results.fill
                              , sourceURL: encodeURIComponent(req.headers.referer)});
        // console.log(results.fill);
    });

};    


// Handle Fill delete on POST
exports.fill_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Fill delete POST');

// Handle Author delete on POST.
// exports.author_delete_post = function (req, res, next) {
    sourceURL = decodeURIComponent(req.body.sourceURL);
    async.parallel({
        fill: function (callback) {
            Fill.findById(req.body.fillId).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        // Author has no books. Delete object and redirect to the list of authors.
        Fill.findByIdAndRemove(req.body.fillId, function deleteFill(err) {
            if (err) { return next(err); }
                // Success - go to Fill list.
                if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                   } else {
                    res.redirect('/tracker/fills/');
                   }
                // res.redirect('/tracker/fills')
            })
    });
    
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
            Station.find(callback).sort({'brand': 1, 'state': 1,  'zipcode': 1});
        },


        }, function(err, results) {
            if (err) { return next(err); }
            if (results.fill==null) { // No results.
                var err = new Error('Fill Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('fill_form', { title: 'Update Fill Info', user: req.user, cars:results.cars, stations:results.stations
                                    , fill: results.fill, sourceURL: encodeURIComponent(req.headers.referer) });
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

        sourceURL = decodeURIComponent(req.body.sourceURL);
        carId = req.body.car;

        // Create a Fill object with escaped and trimmed data, and old ID.
        var fill = new Fill(
            { car: req.body.car,
              fill_date: moment(req.body.fill_date).format(),
              price_per_gal: parseFloat(req.body.price_per_gal),
              total_gal: parseFloat(req.body.total_gal),
              miles: parseFloat(req.body.miles),
              odoMileage: parseInt(req.body.odoMileage),
              station: req.body.station,
              updateTS: moment().format(),
              _id:req.params.id //This is required, or a new ID will be assigned!
             });
        

        var car = new Car(
            {currOdo: parseInt(req.body.odoMileage),
            _id: req.body.car,
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
                res.render('fill_form', { title: 'Update Fill Info', user: req.user, cars:results.cars, stations:results.stations
                                        , fill: fill, sourceURL: encodeURIComponent(req.headers.referer), errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Fill.findByIdAndUpdate(req.params.id, fill, {}, function (err,thefill) {
                if (err) { return next(err); }
                   // Successful - redirect to fill history page.
                   //res.redirect(thefill.url);
                   if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                   } else {
                    res.redirect('/tracker/fills/');
                   }
                });
            Car.findByIdAndUpdate(carId, car, {}, function (err,thecar) {
                if (err) { return next(err); }
                });
        }
    }
];
