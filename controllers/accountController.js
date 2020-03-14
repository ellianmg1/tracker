const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var mongoose = require('mongoose');
var moment = require('moment');
var async = require('async');
var Account = require('../models/account');
var Transaction = require('../models/transaction');
var Bill = require('../models/bill');
var User = require('../models/user');

exports.dashboard = function(req, res, next) {   
    async.parallel({
        account: function(callback) {
            Account.find({'type':{$in :['Checking','Savings']}})
            .exec(callback);
        },

        bill: function(callback) {
            Bill.find(
                {'userid':req.user._id}
            )
            // .sort({'account': -1, 'fill_date': -1, 'odoMileage': -1})
            .populate('payeeAccountID')
            // .populate('station')
            .exec(callback);
        },

        txn_list: function(callback) {
            Transaction.find(
                {'userid':req.user._id}
            )
            // .sort({'account': -1, 'fill_date': -1, 'odoMileage': -1})
            .populate('payFromAccount')
            .populate('payeeAccount')
            .populate('billID')
            .exec(callback);
        },

        // counts: function(callback) {
        //     Account.aggregate([
        //         {$group: { _id: {type: "$type"}, 
        //              count: { $sum: 1 },
        //              total: { $sum: "$currBal"}
        //             }
        //         },                                
        //         {$project:{ _id: 1, count: 1, total: 1}}
        //     ])
        //     .sort({_id: 1})
        //     .exec(callback);
        // },
       
    }, function(err, results) {
        res.render('fin_dashboard', { title: 'Finance Tracker Home', user: req.user, error: err
            , account_list: results.account
            , bill_list: results.bill
            , txn_list: results.txn_list
            // , counts: results.counts
        });
    });
};

// Display list of all accounts
exports.account_list = function(req, res, next) {
    Account.find()
    //   .sort({'type': 1})
      .exec(function (err, list_accounts) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('account_list', { title: 'All Accounts', user: req.user, account_list: list_accounts 
            , urlPath: req.originalUrl
        });
        // console.log(req.originalUrl);
      });
};

// Display detail page for a specific car
exports.account_detail = function(req, res, next) {

    async.parallel({
        account: function(callback) {
            Account.findById(req.params.id)
              .exec(callback);
        },
        
    }, function(err, results) {

        if (err) { return next(err); }
        if (results.account==null) { // No results.
            var err = new Error('Account not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('account_detail', { title: 'Account Detail', account: results.account, user: req.user});
    });

};

// Display car create form on GET
exports.account_create_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Account create GET');
    res.render('account_form', {title: 'Add Account', user: req.user});
};

// Handle car create on POST
exports.account_create_post = [
    // Validate all data.
    // body('accountName').isLength({ min: 1 }).trim().withMessage('Account Name is required'),
    // body('accountID', 'Account ID is required').isLength({ min: 1 }).trim(),
    // body('currStatus', 'Select status').isLength({ min: 1 }).trim(),    
    // body('type', 'VIN is required').isLength({ min: 1 }).trim(),            
    // Sanitize (trim and escape) the brand name field.
    sanitizeBody('*').trim().escape(),
    // sanitizeBody('accountID').trim().escape(),
    // sanitizeBody('status').trim().escape(),
    // sanitizeBody('type').trim().escape(),
    // sanitizeBody('currBal').trim().escape(),    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Account object with escaped and trimmed data.
        var account = new Account(
          { issuer: req.body.issuer ,
            name : req.body.name,
            accountID: req.body.accountID ,
            currStatus: req.body.currStatus ,
            currBal: parseFloat(req.body.currBal) ,
            type: req.body.type ,
            userid: req.user._id,
            createTS: moment().format(),
            updateTS: moment().format(),
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('account_form', { title: 'Add Account', account: account, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Account with same Account ID already exists.
            Account.findOne(
                {'accountID': req.body.accountID}
            )
                .exec( function(err, found_account) {
                     if (err) { return next(err); }

                     if (found_account) {
                         //Account already exists, redirect to its detail page
                         res.redirect(found_account.url);
                     }
                     else {
                         account.save(function (err) {
                           if (err) { return next(err); }
                           //Account saved. Redirect to detail page
                           res.redirect(account.url);
                         });
                     }
                 });
        }
    }
];

// Display car delete form on GET
exports.account_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Account delete GET');
};

// Handle car delete on POST
exports.account_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Account delete POST');
};

// Display car update form on GET
exports.account_update_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Account update GET');    
    Account.findById(req.params.id, function(err, account) {
        if (err) {return next(err);}
        if (account == null) { //No results
            var err = new Error("Account not found - try again");
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('account_form', { title:'Update Account Info', user: req.user, account: account});
        // console.log(car.awd);
    }
)
};

// exports.account_update_post = function(req, res, next) {
//     res.send('NOT IMPLEMENTED: Account update POST');    
// };
// Handle car update on POST
exports.account_update_post = [
    // Validate Fields
    body('accountName').isLength({ min: 1 }).trim().withMessage('Account Name is required'),
    body('accountID', 'Account ID is required').isLength({ min: 1 }).trim(),
    body('status', 'Select status').isLength({ min: 1 }).trim(),    
    // body('awd').isLength(),

    // Sanitize fields
    sanitizeBody('accountName').trim().escape(),
    sanitizeBody('accountID').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('type').trim().escape(),
    sanitizeBody('currBal').trim().escape(),    

    // Process after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
        //create new account object with old _id
        var account = new Account(
            { accountName: req.body.accountName ,
              accountID: req.body.accountID ,
              status: req.body.status ,
              currBal: parseFloat(req.body.currBal) ,
              type: req.body.type ,
              _id: req.params.id
            }
        );
        
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('account_form', { title: 'Update Account Info', user: req.user, account: account, errors: errors.array()});
        return;
        }
        else {
            Account.findByIdAndUpdate(req.params.id, account, {}, function(err, theaccount) {
                if (err) {return next(err);}
                res.redirect(theaccount.url);
            });
        }
    }
];    