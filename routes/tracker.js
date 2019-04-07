var express = require('express');
var router = express.Router();
var passport = require('passport');

// router.use((req,res,next) => {
// 	console.log(req.socket.localAddress.split(':').pop());
// 	console.log(req.socket.remoteAddress.split(':').pop());
// 	next();
// })

// Require controller modules
var car_controller = require('../controllers/carController');
var fill_controller = require('../controllers/fillController');
var part_controller = require('../controllers/partController');
var repair_controller = require('../controllers/repairController');
var station_controller = require('../controllers/stationController');
var category_controller = require('../controllers/categoryController');
// var signin_controller = require('../controllers/signinController');
var User = require('../models/user');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
    if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
};

/// CAR ROUTES ///

/* GET tracker home page. */
router.get('/', isAuthenticated, car_controller.car_main);

/* GET request for creating a Car. NOTE This must come before routes that display Car (uses id) */
router.get('/car/create', isAuthenticated, car_controller.car_create_get);

/* POST request for creating Car. */
router.post('/car/create', isAuthenticated, car_controller.car_create_post);

/* GET request to delete Car. */
router.get('/car/:id/delete', isAuthenticated, car_controller.car_delete_get);

// POST request to delete Car
router.post('/car/:id/delete', isAuthenticated, car_controller.car_delete_post);

/* GET request to update Car. */
router.get('/car/:id/update', isAuthenticated, car_controller.car_update_get);

// POST request to update Car
router.post('/car/:id/update', isAuthenticated, car_controller.car_update_post);

/* GET request for one Car. */
router.get('/car/:id', isAuthenticated, car_controller.car_detail);

/* GET request for list of all Cars. */
router.get('/cars', isAuthenticated, car_controller.car_list);

/// STATION ROUTES ///

/* GET request for creating Station. NOTE This must come before route for id (i.e. display station) */
router.get('/station/create', isAuthenticated, station_controller.station_create_get);

/* POST request for creating Station. */
router.post('/station/create', isAuthenticated, station_controller.station_create_post);

/* GET request to delete Station. */
router.get('/station/:id/delete', isAuthenticated, station_controller.station_delete_get);

// POST request to delete Station
router.post('/station/:id/delete', isAuthenticated, station_controller.station_delete_post);

/* GET request to update Station. */
router.get('/station/:id/update', isAuthenticated, station_controller.station_update_get);

/* POST request to update Station */
router.post('/station/:id/update', isAuthenticated, station_controller.station_update_post);

/* GET request for one Station. */
router.get('/station/:id', isAuthenticated, station_controller.station_detail);

/* GET request for list of all Stations. */
router.get('/stations', isAuthenticated, station_controller.station_list);

/// FILLS ROUTES ///

/* GET request for creating a Fill. NOTE This must come before route that displays Fill (uses id) */
router.get('/fill/create/:id', isAuthenticated, fill_controller.fill_create_get);
router.get('/fill/create', isAuthenticated, fill_controller.fill_create_get);

/* POST request for creating Fill. */
router.post('/fill/create/:id', isAuthenticated, fill_controller.fill_create_post);
router.post('/fill/create', isAuthenticated, fill_controller.fill_create_post);

/* GET request to delete Fill. */
router.get('/fill/:id/delete', isAuthenticated, fill_controller.fill_delete_get);

/* POST request to delete Fill */
router.post('/fill/:id/delete', isAuthenticated, fill_controller.fill_delete_post);

/* GET request to update Fill. */
router.get('/fill/:id/update', isAuthenticated, fill_controller.fill_update_get);

/* POST request to update Fill */
router.post('/fill/:id/update', isAuthenticated, fill_controller.fill_update_post);

/* GET request for Fill History for one Car for specific year. */
router.get('/fill/:id/:year', isAuthenticated, fill_controller.fill_car_year);

/* GET request for one Fill. */
router.get('/fill/:id', isAuthenticated, fill_controller.fill_detail);

/* GET request for Fill Summary. */
//router.get('/fills/', fill_controller.fill_summary);

/* GET request for list of all Fills for specific car. */
router.get('/fills/:id', isAuthenticated, fill_controller.fill_list_car);

/* GET request for list of all Fills. */
router.get('/fills', isAuthenticated, fill_controller.fill_list);

/// REPAIR ROUTES ///

/* GET request for creating a Repair Instance. NOTE This must come before route that displays Repair Instance (uses id) */
router.get('/repair/create/:id', isAuthenticated, repair_controller.repair_create_get);
router.get('/repair/create', isAuthenticated, repair_controller.repair_create_get);
/* POST request for creating Repair. */
router.post('/repair/create/:id', isAuthenticated, repair_controller.repair_create_post);
router.post('/repair/create', isAuthenticated, repair_controller.repair_create_post);

/* GET request to delete Repair. */
router.get('/repair/:id/delete', isAuthenticated, repair_controller.repair_delete_get);

/* POST request to delete Repair */
router.post('/repair/:id/delete', isAuthenticated, repair_controller.repair_delete_post);

/* GET request to update Repair. */
router.get('/repair/:id/update', isAuthenticated, repair_controller.repair_update_get);

/* POST request to update Repair */
router.post('/repair/:id/update', isAuthenticated, repair_controller.repair_update_post);

/* GET request for Repair History for one Car for specific year. */
router.get('/repair/:id/:year', isAuthenticated, repair_controller.repair_car_year);

/* GET request for Repair History for one Car for specific category. */
router.get('/repair/:id/cat/:category', isAuthenticated, repair_controller.repair_car_category);

/* GET request for one Repair. */
router.get('/repair/:id', isAuthenticated, repair_controller.repair_detail);

/* GET request for list of all Repairs for specific Car. */
router.get('/repairs/:id', isAuthenticated, repair_controller.repair_list_car);

/* GET request for list of all Repairs. */
router.get('/repairs', isAuthenticated, repair_controller.repair_list);

/// PART ROUTES ///

/* GET request for creating a Part Instance. NOTE This must come before route that displays Part Instance (uses id) */
router.get('/part/create', isAuthenticated, part_controller.part_create_get);

/* POST request for creating PartInstance. */
router.post('/part/create', isAuthenticated, part_controller.part_create_post);

/* GET request to delete Part. */
router.get('/part/:id/delete', isAuthenticated, part_controller.part_delete_get);

/* POST request to delete Part */
router.post('/part/:id/delete', isAuthenticated, part_controller.part_delete_post);

/* GET request to update Part. */
router.get('/part/:id/update', isAuthenticated, part_controller.part_update_get);

//* POST request to update Part
router.post('/part/:id/update', isAuthenticated, part_controller.part_update_post);

/* GET request for one Part. */
router.get('/part/:id', isAuthenticated, part_controller.part_detail);

/* GET request for list of all Part. */
router.get('/parts', isAuthenticated, part_controller.part_list);

/// CATEGORY ROUTES ///

/* GET request for creating a Category Instance. NOTE This must come before route that displays Category Instance (uses id) */
router.get('/category/create', isAuthenticated, category_controller.category_create_get);

/* POST request for creating BookInstance. */
router.post('/category/create', isAuthenticated, category_controller.category_create_post);

/* GET request to delete BookInstance. */
router.get('/category/:id/delete', isAuthenticated, category_controller.category_delete_get);

/* POST request to delete BookInstance */
router.post('/category/:id/delete', isAuthenticated, category_controller.category_delete_post);

/* GET request to update BookInstance. */
router.get('/category/:id/update', isAuthenticated, category_controller.category_update_get);

//* POST request to update BookInstance
router.post('/category/:id/update', isAuthenticated, category_controller.category_update_post);

/* GET request for one BookInstance. */
router.get('/category/:id', isAuthenticated, category_controller.category_detail);

/* GET request for list of all BookInstance. */
router.get('/categories', isAuthenticated, category_controller.category_list);

// module.exports = router;
module.exports = function(passport) {
    return router;
}