var Account = require('../models/account');
var Bill = require('../models/bill');
var Transaction = require('../models/transaction');
var User = require('../models/user');
var moment = require('moment');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Bills
exports.bill_list = function(req, res, next) {

    async.parallel({
        account: function(callback) {
            Account.find({
                $and: [
                    {'userid':req.user._id},
                    {'type':{$in :['Credit','Loan','Utility']}} 
                //    {"$expr": { "$eq": [{"$year": "$fill_date"},fill_year]}} 
                ]
            })
            .exec(callback);
        },

        bill: function(callback) {
            Bill.find(
                {'userid':req.user._id}
            )
            // .sort({'account': -1, 'fill_date': -1, 'odoMileage': -1})
            .populate('payeeAccountID')
            .exec(callback);
        },
      
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('bill_list', {title: 'Bill History', user: req.user, account_list: results.account, bill_list: results.bill
            , sourceURL: encodeURIComponent(req.originalUrl) 
        });
        // res.render('fill_list', {title: 'Fill History', user: req.user, car_list: results.car, fill_list: results.fill, fill_summ: results.fill_summary});
        // console.log('accounts: ',results.account);
        // console.log('bills : ',results.bill);
    });
};

// Display list of all Bills for selected Account
exports.bill_list_account = function(req, res, next) {
    async.parallel({
        account: function(callback) {
            Account.findById(req.params.id)
            .exec(callback);
        },

        bill: function(callback) {
            Bill.find({ 
                        $and: [{'payeeAccountID':req.params.id}, 
                            //    {"$expr": { "$eq": [{"$year": "$fill_date"},fill_year]}} 
                            ]
                    }
                )
            .sort({'payDue_dt': -1})
            .populate('payeeAccountID')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('bill_list_account', {title: 'Bill History', user: req.user, account: results.account, bill_list: results.bill});
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
exports.bill_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Fill detail: ' + req.params.id);
};

// Display Fill create form on GET
//exports.fill_create_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill create GET');
//};

exports.bill_create_get = function(req, res, next) {
    // If Account ID is present in the URL, pass it to the Form
    if (req.params.id) {
        var account_id = req.params.id.toString();
    } else {
        var account_id = 0;
    };
    // Get all active Accounts, which is needed to associate to the Bill.
    async.parallel({
        account: function(callback) {
            Account.find({
                $and: [
                    {'userid':req.user._id},
                    {'currStatus':'Active'},
                    {'type':{$in :['Credit','Loan','Utility']}}
                ]
                })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('bill_form', { title: 'Add New Bill',user: req.user
            , account_list: results.account
            , account_id: account_id
            , sourceURL: encodeURIComponent(req.headers.referer) 
        });
    });

};

exports.bill_create_post = [
    // Validate fields
    // body('payeeAccountID', 'An Account Car must be selected').isLength({ min: 1 }).trim(),
    // body('fill_date', 'Fill Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    // body('price_per_gal', 'Price Per Gallon must not be empty.').isLength({ min: 1 }).trim(),
    // body('total_gal', 'Total Gallons must not be empty').isLength({ min: 1 }).trim(),
    // body('miles', 'Miles must not be empty').isLength({ min: 1 }).trim(),
    // body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    // body('station', 'Station must be selected').isLength({ min: 1 }).trim(),
    // Sanitize fields
    sanitizeBody('*').trim().escape(),
    // Process request after validation and sanitization
    (req, res, next) => {
        
        // Extract the validation errors from a request 
        const errors = validationResult(req);
        var account_id = 0;
        var sourceURL = decodeURIComponent(req.body.sourceURL);
        
        // Create a Fill object with escaped and trimmed data.
        var bill = new Bill(
          { payeeAccountID: req.body.payeeAccountID,
            payDue_dt: moment(req.body.payDue_dt).format(),
            billAmount: parseFloat(req.body.billAmount),
            currStatus: req.body.currStatus,
            userid: req.user._id,
            createTS: moment().format(),
            updateTS: moment().format(),
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                account: function(callback) {
                    Account.find({
                        $and: [
                            {'userid':req.user._id},
                            {'currStatus':'Active'},
                            {'type':{$in :['Credit','Loan','Utility']}}
                        ]
                        })
                    .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('bill_form', { title: 'Add New Bill', user: req.user
                        , account_list: results.account
                        , account_id: account_id
                        , sourceURL: encodeURIComponent(req.headers.referer)
                        , bill: bill, errors: errors.array() 
                });
            });
            return;
        }
        else {
            // Data from form is valid. Save Bill.
            bill.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to fill history page.
                if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                } else {
                res.redirect('/fintra/');
                }
            });
        }
    }
];

// Display Fill delete form on GET
exports.bill_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Fill delete GET');
    async.parallel({
        bill: function (callback) {
            Bill.findById(req.params.id).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.bill == null) { // No results.
            res.redirect('/fintra/bills');
        }
        // Successful, so render.
        res.render('bill_delete', { title: 'Delete Bill', user: req.user, bill: results.bill
                              , sourceURL: encodeURIComponent(req.headers.referer)});
        // console.log(results.fill);
    });

};    

// Handle Fill delete on POST
exports.bill_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Fill delete POST');
    var sourceURL = decodeURIComponent(req.body.sourceURL);
    console.log(sourceURL);
    async.parallel({
        bill: function (callback) {
            Bill.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        // Delete object and redirect to the list of fills.
        Bill.findByIdAndRemove(req.params.id, function deleteBill(err) {
            if (err) { return next(err); }
                // Success - go to Bill list.
                if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                } else {
                    res.redirect('/fintra/bills/');
                }
            })
    });
    
};

// Display Fill update form on GET
//exports.fill_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill update GET');
//};
exports.bill_update_get = function(req, res, next) {

    // Get Fill, Cars and Stations for form.
    async.parallel({
        bill: function(callback) {
            Bill.findById(req.params.id).populate('account').exec(callback);
        },
        accounts: function(callback) {
            Account.find(callback);
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.bill==null) { // No results.
                var err = new Error('Bill Details not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('bill_form', { title: 'Update Bill', user: req.user, account_list:results.accounts
                                    , bill: results.bill, sourceURL: encodeURIComponent(req.headers.referer) });
        });

};

// Handle fill update on POST
//exports.fill_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Fill update POST');
//};
exports.bill_update_post = [

    // Validate fields
    // body('car', 'A Car must be selected').isLength({ min: 1 }).trim(),
    // body('fill_date', 'Fill Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
    // body('price_per_gal', 'Price Per Gallon must not be empty.').isLength({ min: 1 }).trim(),
    // body('total_gal', 'Total Gallons must not be empty').isLength({ min: 1 }).trim(),
    // body('miles', 'Miles must not be empty').isLength({ min: 1 }).trim(),
    // body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
    // body('station', 'Station must be selected').isLength({ min: 1 }).trim(),
    
    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        sourceURL = decodeURIComponent(req.body.sourceURL);

        // Create a Bill object with escaped and trimmed data, and old ID.
        var bill = new Bill(
            { payeeAccountID: req.body.account,
              payDue_dt: moment(req.body.payDue_dt).format(),
              billAmount: parseFloat(req.body.billAmount),
              status: req.body.status,
              updateTS: moment().format(),
              _id:req.params.id //This is required, or a new ID will be assigned!
             });
        

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all cars and stations for form
            async.parallel({
                account: function(callback) {
                    Account.find({
                        $and: [
                            {'userid':req.user._id},
                            {'status':'Active'},
                            {'type':{$in :['Credit','Loan']}}
                        ]
                        })
                    .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('bill_form', { title: 'Update Bill', user: req.user
                        , account_list: results.account
                        , account_id: account_id
                        , sourceURL: encodeURIComponent(req.headers.referer)
                        , bill: bill, errors: errors.array() 
                });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Bill.findByIdAndUpdate(req.params.id, bill, {}, function (err,thebill) {
                if (err) { return next(err); }
                // Successful - redirect to fill history page.
                //res.redirect(thefill.url);
                if (sourceURL && sourceURL !== undefined) {
                    res.redirect(sourceURL);
                } else {
                    res.redirect('/fintra/');
                }
            });
        }
    }
];
