var moment = require('moment');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StationSchema = new Schema(
  {
    brand: {type: String, required: true, max: 100},
    zipcode: {type: Number, required: true, min: 00001, max: 99999},
    city: {type: String},
    state: {type: String},
  }
);

// Virtual for Station's Name
StationSchema
.virtual('name')
.get(function () {
  return this.brand + ', ' + this.city + ', ' + this.state + ', ' + this.zipcode;
});

// Virtual for station's URL
StationSchema
.virtual('url')
.get(function () {
  return '/tracker/station/' + this._id;
});

// Virtual for Car's Name with '#'
StationSchema
.virtual('hashname')
.get(function () {
  return '#'+this.brand;
});

// Virtual for Car's Name with '#'
StationSchema
.virtual('nohashname')
.get(function () {
  return this.brand;
});

//Export model
module.exports = mongoose.model('Station', StationSchema);