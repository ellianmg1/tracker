var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var FillSchema = new Schema(
    {
    car: { type: Schema.ObjectId, ref: 'Car', required: true }, //reference to the associated car
    fill_date: {type: Date},
    price_per_gal: {type: SchemaTypes.Double, required: true},
    total_gal: {type: SchemaTypes.Double, required: true},
    miles: {type: SchemaTypes.Double, required: true},
    odoMileage: {type: Number, required: true},
    station: {type: Schema.ObjectId, ref: 'Station', required: true}, //reference to the associated station
    createTS: {type: Date},
    updateTS: {type: Date},
    forecast: {type: SchemaTypes.Double},
    }
  );

// Virtual for fill instances URL
FillSchema
.virtual('url')
.get(function () {
  return '/tracker/fill/' + this._id;
});

// Virtual for total paid
FillSchema
.virtual('total_price')
.get(function () {
  return (this.price_per_gal * this.total_gal).toFixed(2);
});

// Virtual for Avg MPG
FillSchema
.virtual('avg_mpg')
.get(function () {
  return (this.miles / this.total_gal).toFixed(2);
});

FillSchema
.virtual('fill_dt_formatted')
.get(function () {
  return moment(this.fill_date).format('DD-MMM-YY');
});

//FillSchema
//.virtual('fill_dt_sort')
//.get(function () {
//  return moment(this.fill_date).format('YYYYMMDD');
//});

FillSchema
.virtual('fill_dt_yyyy_mm_dd')
.get(function () {
  return moment(this.fill_date).format('YYYY-MM-DD');
});

FillSchema
.virtual('fill_dt_yyyy')
.get(function () {
  return moment(this.fill_date).format('YYYY');
});

//Export model
module.exports = mongoose.model('Fill', FillSchema);