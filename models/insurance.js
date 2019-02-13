<<<<<<< HEAD
var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.
var Schema = mongoose.Schema;

var InsuranceSchema = new Schema({
  provider: {type: String, required: true},
  policyNb: {type: String, required: true},
  effDt: {type: Date, required: true},
  expDt: {type: Date, required: true},
  category: {type: String, required: true, enum:['Car', 'Home', 'Other'], default:'Car'},
  payDt: {type: Date},
  forCar: {type: Schema.ObjectId, ref: 'Car'}, //reference to the associated car
  cost: {type: Number},
  status: {type: String, required: true, enum:['Active', 'Expired', 'Future'], default:'Expired'}
});

// Virtual for Insurance's URL
InsuranceSchema
.virtual('url')
.get(function () {
  return '/tracker/insurance/' + this._id;
});

// // Virtual for Car's Name with '#'
// InsuranceSchema
// .virtual('hashname')
// .get(function () {
//   return '#'+this.make + this.year + this.model;
// });

// // Virtual for Car's Name with '#'
// InsuranceSchema
// .virtual('nohashname')
// .get(function () {
//   return this.make + this.year + this.model;
// });

// Virtual for Car's Short Name
InsuranceSchema
.virtual('short_desc')
.get(function () {
  return this.provider + ' - ' + this.policyNb;
});

// InsuranceSchema
// .virtual('purchase_dt_format')
// .get(function () {
//   if (this.purchase_dt) {
//     return moment(this.purchase_dt).format('MMMM Do, YYYY');
//   }
// });

// InsuranceSchema
// .virtual('purchase_dt_yyyy_mm_dd')
// .get(function () {
//   return moment(this.purchase_dt).format('YYYY-MM-DD');
// });

//Export model
=======
var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.
var Schema = mongoose.Schema;

var InsuranceSchema = new Schema({
  provider: {type: String, required: true},
  policyNb: {type: String, required: true},
  effDt: {type: Date, required: true},
  expDt: {type: Date, required: true},
  category: {type: String, required: true, enum:['Car', 'Home', 'Other'], default:'Car'},
  payDt: {type: Date},
  forCar: {type: Schema.ObjectId, ref: 'Car'}, //reference to the associated car
  cost: {type: Number},
  status: {type: String, required: true, enum:['Active', 'Expired', 'Future'], default:'Expired'}
});

// Virtual for Insurance's URL
InsuranceSchema
.virtual('url')
.get(function () {
  return '/tracker/insurance/' + this._id;
});

// // Virtual for Car's Name with '#'
// InsuranceSchema
// .virtual('hashname')
// .get(function () {
//   return '#'+this.make + this.year + this.model;
// });

// // Virtual for Car's Name with '#'
// InsuranceSchema
// .virtual('nohashname')
// .get(function () {
//   return this.make + this.year + this.model;
// });

// Virtual for Car's Short Name
InsuranceSchema
.virtual('short_desc')
.get(function () {
  return this.provider + ' - ' + this.policyNb;
});

// InsuranceSchema
// .virtual('purchase_dt_format')
// .get(function () {
//   if (this.purchase_dt) {
//     return moment(this.purchase_dt).format('MMMM Do, YYYY');
//   }
// });

// InsuranceSchema
// .virtual('purchase_dt_yyyy_mm_dd')
// .get(function () {
//   return moment(this.purchase_dt).format('YYYY-MM-DD');
// });

//Export model
>>>>>>> 0529bc934ab7ef7234ca459fdc173971bed20856
module.exports = mongoose.model('Insurance', InsuranceSchema);