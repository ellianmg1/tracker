// var Part = require('../models/part');
var Category = require('../models/category');
var User = require('../models/user');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Categories
exports.category_list = function(req, res, next) {

    Category.find()
      .sort({'interval':1, 'name':1})
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('category_list', { title: 'Maintenance Minder Set ups', user: req.user, category_list: list_categories});
      });
  
};

// Display detail page for a specific Category
exports.category_detail = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Part detail');
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Maintenance Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Maintenance Category Detail', user: req.user, category: results.category } );
    });

};

// Display Category create form on GET
exports.category_create_get = function(req, res, next) {
    //res.send('NOT IMPLEMENTED: Part create GET');
    res.render('category_form', { title: 'Add Maintenance Category', user: req.user });
};

exports.category_create_post = [
    // Validate fields
    body('name', 'Category name is missing.').isLength({ min: 1 }).trim(),
    body('desc', 'Description is missing.').isLength({ min: 1 }).trim(),
    // body('partNum', 'Part number must be entered.').isLength({ min: 1 }).trim(),
    // body('s_name', 'Part name is missing.').isLength({ min: 1 }).trim(),
    // body('manuf', 'Part Manufacturer is missing.').isLength({ min: 1 }).trim(),    
    // Sanitize fields
    sanitizeBody('*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Part object with escaped and trimmed data.
        var category = new Category(
          { name: req.body.name,
            desc: req.body.desc,
            notes: req.body.notes,
            interval: req.body.interval
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('category_form', { title: 'Add Maintenance Category', user: req.user, category: category, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. 
            // Check if Category already exists. 
            Category.findOne(
                { $and: [
                    {'name': req.body.name},
                    {'interval': req.body.interval}
                ]
                }
            )
            .exec( function(err, found_category) {
                if (err) { return next(err); }

                if (found_category) {
                    //Part already exists, redirect 
                    res.redirect(found_category.url);
                }
                
                else {
                    // Part not found, save Part
                    category.save(function (err) {
                        if (err) { return next(err); }
                           //successful - redirect to Parts List page.
                        res.redirect(category.url);
                           //res.send('NOT IMPLEMENTED: Part detail: ' + part.url);
                        //    res.redirect('/tracker/categories/');
                        });
        
                }
            });
        }
    }
];


// Display Part delete form on GET
exports.category_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Part delete GET');
};

// Handle Part delete on POST
exports.category_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Part delete POST');
};

// Display Part update form on GET
//exports.category_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Part update GET');
//};

exports.category_update_get = function(req, res, next) {
    // Get category and car details for form.
    Category.findById(req.params.id, function(err, category) {
        if (err) {return next(err);}
        if (category == null) { //No results
            var err = new Error("Category not found - try again");
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('category_form', { title:'Update Category', user: req.user, category: category});
    })
};


// Handle Part update on POST
//exports.category_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Part update POST');
//};

exports.category_update_post = [

    // Validate required fields
    body('name', 'Category name is missing.').isLength({ min: 1 }).trim(),
    body('desc', 'Description is missing.').isLength({ min: 1 }).trim(),
    // body('s_name', 'Part name is missing.').isLength({ min: 1 }).trim(),
    // body('desc', 'Part description is missing.').isLength({ min: 1 }).trim(),
    // body('manuf', 'Part Manufacturer is missing.').isLength({ min: 1 }).trim(),        
    // Sanitize fields
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a Fill object with escaped and trimmed data, and old ID.
        var category = new Category(
            { name: req.body.name,
              desc: req.body.desc,
             notes: req.body.notes,
          interval: req.body.interval,
               _id: req.params.id //This is required, or a new ID will be assigned!
            });
              
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('category_form', { title:'Update Category', user: req.user, category: category});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
                if (err) { return next(err); }
                   // Successful - redirect to Part List page.
                   //res.redirect(thepart.url);
                   res.redirect('/tracker/categories/');
                });
        }
    }
];
