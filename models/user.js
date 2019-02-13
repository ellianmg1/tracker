var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    id: {type: String},
    username: {type: String, required: true, max: 100},
    password: {type: String, required: true, max: 100},
    firstName: {type: String, required: true, max: 100},
    lastName: {type: String, required: true, max: 100},
    email: {type: String},
    startDate: {type: Date},
    lastUpdate: {type: Date},
  }
);

// Virtual for Station's Name
UserSchema
.virtual('fullName')
.get(function () {
  return this.firstName + ' ' + this.lastName;
});

UserSchema
.virtual('joinDate')
.get(function () {
  if (this.startDate) {
    return moment(this.startDate).format('MMMM Do, YYYY');
  }
});

// Virtual for station's URL
UserSchema
.virtual('url')
.get(function () {
  return '/user/'+this._id;
});

//Export model
module.exports = mongoose.model('User', UserSchema);