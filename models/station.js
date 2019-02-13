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

// Virtual for author's DOB formatted
//AuthorSchema
//.virtual('date_of_birth1')
//.get(function () {
//  return this.date_of_birth ? moment(this.date_of_birth).format('M/D/YYYY') : '';
//});

// Virtual for author's DOD formatted
//AuthorSchema
//.virtual('date_of_death1')
//.get(function () {
//  return this.date_of_death ? moment(this.date_of_death).format('M/D/YYYY') : '';
//});

//Export model
module.exports = mongoose.model('Station', StationSchema);