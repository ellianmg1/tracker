var express = require('express');
var router = express.Router();
var passport = require('passport');

// Require controller modules
var account_controller = require('../controllers/accountController');
var transaction_controller = require('../controllers/transactionController');
var bill_controller = require('../controllers/billController');
var paycheck_controller = require('../controllers/paycheckController');
var User = require('../models/user');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
    if (req.isAuthenticated())
        return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

/// ACCOUNT ROUTES ///

/* GET Finance tracker home page. */
router.get('/', isAuthenticated, account_controller.dashboard);

/* GET request for creating an Account. NOTE This must come before routes that display Account (uses id) */
router.get('/account/create', isAuthenticated, account_controller.account_create_get);

/* POST request for creating Account. */
router.post('/account/create', isAuthenticated, account_controller.account_create_post);

/* GET request to delete Account. */
router.get('/account/:id/delete', isAuthenticated, account_controller.account_delete_get);

// POST request to delete Account
router.post('/account/:id/delete', isAuthenticated, account_controller.account_delete_post);

/* GET request to update Account. */
router.get('/account/:id/update', isAuthenticated, account_controller.account_update_get);

// POST request to update Account
router.post('/account/:id/update', isAuthenticated, account_controller.account_update_post);

/* GET request for one Account. */
router.get('/account/:id', isAuthenticated, account_controller.account_detail);

/* GET request for list of all Accounts. */
router.get('/accounts', isAuthenticated, account_controller.account_list);

/// BILL ROUTES ////
/* GET request for creating a Bill Instance. NOTE This must come before routes that display Bill (uses id) */
router.get('/bill/create/:id', isAuthenticated, bill_controller.bill_create_get);
router.get('/bill/create', isAuthenticated, bill_controller.bill_create_get);

/* POST request for creating Bill Instance. */
router.post('/bill/create/:id', isAuthenticated, bill_controller.bill_create_post);
router.post('/bill/create', isAuthenticated, bill_controller.bill_create_post);

/* GET request to update Bill. */
router.get('/bill/:id/update', isAuthenticated, bill_controller.bill_update_get);

// POST request to update Account
router.post('/bill/:id/update', isAuthenticated, bill_controller.bill_update_post);

/* POST request for deleting Bill Instance. */
router.post('/bill/:id/delete', isAuthenticated, bill_controller.bill_delete_post);

/* GET request for list of all Bills. */
router.get('/bills', isAuthenticated, bill_controller.bill_list);


/// TRANSACTION ROUTES ///

/* GET request for creating a Transaction. NOTE This must come before route that displays Transaction Instance (uses id) */
router.get('/transaction/create/:id', isAuthenticated, transaction_controller.transaction_create_get);
router.get('/transaction/create', isAuthenticated, transaction_controller.transaction_create_get);
router.post('/transaction/create', isAuthenticated, transaction_controller.transaction_create_post);

/* GET request to update Transaction. */
// router.get('/transaction/:id/update', isAuthenticated, transaction_controller.transaction_update_get);

// POST request to update Transaction
// router.post('/transaction/:id/update', isAuthenticated, transaction_controller.transaction_update_post);

/* POST request for deleting Transaction Instance. */
router.post('/transaction/:id/delete', isAuthenticated, transaction_controller.transaction_delete_post);

/* GET request for list of all Transactions for specific Account. */
router.get('/transactions/:id', isAuthenticated, transaction_controller.transaction_list_account);

/* GET request for list of all Transactions. */
router.get('/transactions', isAuthenticated, transaction_controller.transaction_list);

/// PAYCHECK ROUTES ///

/* GET request for creating a PAYCHECK. NOTE This must come before route that displays PAYCHECK Instance (uses id) */
router.get('/paycheck/create/:id', isAuthenticated, paycheck_controller.paycheck_create_get);
router.get('/paycheck/create', isAuthenticated, paycheck_controller.paycheck_create_get);
router.post('/paycheck/create', isAuthenticated, paycheck_controller.paycheck_create_post);

/* GET request to update Transaction. */
// router.get('/paycheck/:id/update', isAuthenticated, paycheck_controller.paycheck_update_get);

// POST request to update Transaction
// router.post('/paycheck/:id/update', isAuthenticated, paycheck_controller.paycheck_update_post);

/* POST request for deleting Transaction Instance. */
router.post('/paycheck/:id/delete', isAuthenticated, paycheck_controller.paycheck_delete_post);

/* GET request for list of all Transactions for specific Account. */
router.get('/paycheck/:id', isAuthenticated, paycheck_controller.paycheck_list_account);

/* GET request for list of all Transactions. */
router.get('/paychecks', isAuthenticated, paycheck_controller.paycheck_list);

// module.exports = router;
module.exports = function(passport) {
    return router;
}