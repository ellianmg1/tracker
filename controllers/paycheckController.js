var Paycheck = require('../models/paycheck');
var Paycheck = require('../models/paycheck');
var Account = require('../models/account');
var Bill = require('../models/bill');
var User = require('../models/user');
var async = require('async');
var moment = require('moment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Paychecks
exports.paycheck_list = function(req, res, next) {

    async.parallel({
        account: function(callback) {
            Account.find({'userid':req.user._id})
            .exec(callback);
        },
        paycheck: function(callback) {
            Paycheck.find(
                {$and: [{'userid': req.user._id}]}
            )
            // .sort({'bank': -1, 'work_date': -1, 'category': -1})
            .populate('payFromAccount')
            .populate('payeeAccount')
            .populate('billID')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('paycheck_list', {title: 'Paycheck List', user: req.user
            , account_list: results.account, paycheck_list: results.paycheck
            , sourceURL: encodeURIComponent(req.originalUrl)
        });        
        // console.log(results.paycheck);
    });
};

// Display list of all Paychecks for selected account
exports.paycheck_list_account = function(req, res, next) {
    async.parallel({
        account: function(callback) {
            Account.findById(req.params.id)
            .exec(callback);
        },

        paycheck: function(callback) {
            Paycheck.find({ 
                        $or: [
                            {'payFromAccount':req.params.id},
                            {'payeeAccount':req.params.id}
                        ]
                    }
                )
            .sort({'payment_dt': -1})
            .populate('payFromAccount')
            .populate('payeeAccount')
            .populate('billID')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('paycheck_list_account', {title: 'Paycheck History', user: req.user
        , account_list: results.account, paycheck_list: results.paycheck
        });
    });
};

// exports.paycheck_bank_year = function(req, res, next) {
//     const work_year = parseInt(req.params.year);
//     async.parallel({
//         bank: function(callback) {
//             Bank.findById(req.params.id)
//             .exec(callback);
//         },
//         paycheck: function(callback) {
//             Paycheck.find({
//                          $and: [{'bank':req.params.id}, 
//                                 {"$expr": { "$eq": [{"$year": "$work_date"},work_year]}} 
//                         ]
//                 }
//             )
//             .sort({'work_date': -1, 'category': -1, 'amount': -1})
//             .populate('bank')
//             .populate('part')
//             .exec(callback);
//         },
//     }, function(err, results) {
//         if (err) {return next(err);}
//         res.render('paycheck_list_year', {title: 'Paycheck History', user: req.user, bank: results.bank, paycheck_list: results.paycheck, work_year: work_year});
//     });
// };


// Display detail page for a specific Paycheck
exports.paycheck_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Paycheck detail');
    async.parallel({
        paycheck: function(callback) {
            Paycheck.findById(req.params.id)
              .populate('payFromAccount')
              .populate('payeeAccount')
              .populate('billID')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.paycheck==null) { // No results.
            var err = new Error('Paycheck not found');
            err.status = 404;
            return next(err);
        }
      // Successful, so render
        res.render('paycheck_detail', { title: 'Paycheck Detail', user: req.user, paycheck: results.paycheck } );
    });
};

exports.paycheck_create_get = function(req, res, next) {
    // console.log('create get: ',req.body);
    // If Account ID is present in the URL, pass it to the Form
    if (req.params.id) {
        var account_id = req.params.id.toString();
    } else {
        var account_id = 0;
    };

    // Get all accounts, which we can use for adding to a paycheck.
    async.parallel({
        accounts: function(callback) {
            Account.find({
                $and: [
                    {'userid':req.user._id},
                    {'currStatus':'Active'},
                    // {'type':{$in :['Credit','Loan']}}
                ]
            })
            .exec(callback);
        },
        bill_list: function(callback) {
            Bill.find(
                {$and: [
                    {'userid':req.user._id},
                    {'currStatus':{$in :['Due','Scheduled']}}
                ]}
            )
            .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); console.log(err);}
        console.log(results.accounts);
        console.log(results.bill_list);
        res.render('paycheck_form', { title: 'Add Paycheck Info', user: req.user
            , accounts:results.accounts, account_id: account_id 
        });
    });

};

exports.paycheck_create_post = [
//     // Validate fields
//     body('category', 'A Category must be selected').isLength({ min: 1 }).trim(),
//     body('bank', 'A Bank must be selected').isLength({ min: 1 }).trim(),
//     body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
//     body('work_date', 'Work Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
//     body('amount', 'Cost must not be empty.').isLength({ min: 1 }).trim(),
//     body('shop_loc', 'Work Location must not be empty').isLength({ min: 1 }).trim(),
//     body('part', 'Select Part from the list').isLength({ min: 1 }).trim(),
//     body('purchased_at', 'Purchase location must be selected').isLength({ min: 1 }).trim(),
//     // Sanitize fields
    sanitizeBody('*').trim().escape(),
//     //sanitizeBody('genre.*').trim().escape(),
//     // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Paycheck object with escaped and trimmed data.
        var paycheck = new Paycheck(
          { payFromAccount: req.body.payFromAccount,
            payeeAccount: req.body.payeeAccount,
            payment_dt: moment(req.body.payment_dt).format(),
            payAmount: parseFloat(req.body.payAmount),
            currStatus: req.body.currStatus,
            userid: req.user._id,
            createTS: moment().format(),
            updateTS: moment().format(),
        });
        console.log(paycheck);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all accounts form
            async.parallel({
                accounts: function(callback) {
                    Account.find({
                        $and: [
                            {'userid':req.user._id},
                            {'currStatus':'Active'},
                            // {'type':{$in :['Credit','Loan']}}
                        ]
                    })
                    .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // render form
                res.render('paycheck_form', { title: 'Add Paycheck Info Failed', user: req.user
                    , accounts:results.accounts, account_id: account_id, errors: errors.array() 
                });
            });
            return;
        } else {
            // Data from form is valid. Save Paycheck instance.
            paycheck.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to paycheck history page.
                   //res.redirect(paycheck.url);
                   //res.send('NOT IMPLEMENTED: Fill detail: ' + paycheck.url);
                   res.redirect('/fintra/paychecks/');
                });
        }
    }
];

// Display Paycheck delete form on GET
exports.paycheck_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Paycheck delete GET');
};

// Handle Paycheck delete on POST
exports.paycheck_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Paycheck delete POST');
};

// Display Paycheck update form on GET
//exports.paycheck_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Paycheck update GET');
//};

// exports.paycheck_update_get = function(req, res, next) {

//     // Get Paycheck and Bank details for form.
//     async.parallel({
//         paycheck: function(callback) {
//             Paycheck.findById(req.params.id)
//             .populate('bank')
//             .populate('part')
//             .exec(callback);
//         },
//         banks: function(callback) {
//             Bank.find(callback);
//         },
//         parts: function(callback) {
//             //Part.find(callback);
//             Part.find()
//             .sort({'manuf': 1, 'partNum': 1})            
//             .exec(callback);
//         },
//         // category: function(callback) {
//         //     Category.find(callback);
//         // },

//         }, function(err, results) {
//             if (err) { return next(err); }
//             if (results.paycheck==null) { // No results.
//                 var err = new Error('Paycheck Details not found');
//                 err.status = 404;
//                 return next(err);
//             }
//             // Success.
//             res.render('paycheck_form', { title: 'Update Paycheck Info', user: req.user, banks:results.banks, parts:results.parts, paycheck: results.paycheck });
//             //console.log(results.paycheck.work_dt_form);
//         });

// };


// Handle Paycheck update on POST
//exports.paycheck_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Paycheck update POST');
//};

// exports.paycheck_update_post = [

//     // Validate fields
//     body('category', 'A Category must be selected').isLength({ min: 1 }).trim(),
//     body('bank', 'A Bank must be selected').isLength({ min: 1 }).trim(),
//     body('odoMileage', 'Odometer Mileage must not be empty').isLength({ min: 1 }).trim(),
//     body('work_date', 'Work Date must not be empty.').isLength({ min: 1 }).trim().isISO8601(),
//     body('amount', 'Cost must not be empty.').isLength({ min: 1 }).trim(),
//     body('shop_loc', 'Work Location must not be empty').isLength({ min: 1 }).trim(),
//     body('part', 'Select Part from the list').isLength({ min: 1 }).trim(),
//     body('purchased_at', 'Purchase location must be selected').isLength({ min: 1 }).trim(),
//     // Sanitize fields
//     sanitizeBody('paycheck.*').trim().escape(),

//     // Process request after validation and sanitization
//     (req, res, next) => {

//         // Extract the validation errors from a request 
//         const errors = validationResult(req);

//         // Create a Paycheck object with escaped and trimmed data, and old ID.
//         var paycheck = new Paycheck(
//             { category: req.body.category,
//               bank: req.body.bank,
//               odoMileage: req.body.odoMileage,
//               work_date: moment(req.body.work_date).format(),
//               part: req.body.part,
//               amount: parseFloat(req.body.amount),
//               shop_loc: req.body.shop_loc,
//               work_desc: req.body.work_desc,
//               purchased_at: req.body.purchased_at,
//               _id:req.params.id
//             });
              
//         if (!errors.isEmpty()) {
//             // There are errors. Render form again with sanitized values/error messages.

//             // Get all banks and stations for form
//             async.parallel({
//                 banks: function(callback) {
//                     Bank.find(callback);
//                 },
//                 parts: function(callback) {
//                     Part.find(callback);
//                 }
//             }, function(err, results) {
//                 if (err) { return next(err); }
//                 res.render('paycheck_form', { title: 'Update Paycheck Info Failed', user: req.user, banks:results.banks, parts:results.parts, paycheck: paycheck, errors: errors.array() });
//             });
//             return;
//         }
//         else {
//             // Data from form is valid. Update the record.
//             Paycheck.findByIdAndUpdate(req.params.id, paycheck, {}, function (err,thepaycheck) {
//                 if (err) { return next(err); }
//                    // Successful - redirect to Paycheck history page.
//                    res.redirect(thepaycheck.url);
//                 //    res.redirect('/tracker/paychecks/');
//                 });
//         }
//     }
// ];
