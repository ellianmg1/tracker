var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.
var Schema = mongoose.Schema;

var CarSchema = new Schema({
  vin: {type: String, required: true},
  year: {type: String, required: true},
  make: {type: String, required: true},
  model: {type: String, required: true},
  trim: {type: String, required: true},
  status: {type: String, required: true, enum:['Active', 'Sold', 'Test'], default:'Active'},
  purchase_dt: {type: Date},
  awd: {type: String},
  startOdo:{type: Number},
  currOdo: {type: Number},
  color: {type: String},
  userid: {type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
  price: {type: Number},
  path: {type: String},
});

// Virtual for Car's URL
CarSchema
.virtual('url')
.get(function () {
  return '/tracker/car/' + this._id;
});

// Virtual for Car's Name
CarSchema
.virtual('name')
.get(function () {
  return this.year + ' ' + this.make + ' ' + this.model;
});

// Virtual for Car's Name with '#'
CarSchema
.virtual('hashname')
.get(function () {
  return '#'+this.make + this.year + this.model;
});

// Virtual for Car's Name with '#'
CarSchema
.virtual('nohashname')
.get(function () {
  return this.make + this.year + this.model;
});

// Virtual for Car's Short Name
CarSchema
.virtual('short_name')
.get(function () {
  return this.year + ' ' + this.model;
});

CarSchema
.virtual('purchase_dt_format')
.get(function () {
  if (this.purchase_dt) {
    return moment(this.purchase_dt).format('MMMM Do, YYYY');
  }
});

CarSchema
.virtual('purchase_dt_yyyy_mm_dd')
.get(function () {
  return moment(this.purchase_dt).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('Car', CarSchema);