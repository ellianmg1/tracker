var mongoose = require('mongoose');
// var moment = require('moment'); // For date handling.
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var AccountSchema = new Schema({
  issuer: {type: String, required: true},
  name: {type: String, required: true},
  accountID: {type: String, required: true},
  currStatus: {type: String, required: true, enum:['Active', 'Closed'], default:'Active'},
  currBal: {type: SchemaTypes.Double},
  type: {type: String, required: true, enum:['Checking', 'Savings', 'Credit', 'Loan', 'Utility','Other']},
  userid: {type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
  createTS: {type: Date},
  updateTS: {type: Date},
});

// Virtual for Car's URL
AccountSchema
.virtual('url')
.get(function () {
  return '/fintra/account/' + this._id;
});

// Virtual for Car's Name
AccountSchema
.virtual('fullname')
.get(function () {
  return this.issuer + ' ' + this.name;
});

// Virtual for account's Name with '#'
AccountSchema
.virtual('hashname')
.get(function () {
  return '#'+this.issuer.replace(/ /g,'') + this.accountID + this.type;
});

// Virtual for account's Name with '#'
AccountSchema
.virtual('nohashname')
.get(function () {
  return this.issuer.replace(/ /g,'') + this.accountID + this.type;
});

// // Virtual for Car's Short Name
// CarSchema
// .virtual('short_name')
// .get(function () {
//   return this.year + ' ' + this.model;
// });

// CarSchema
// .virtual('purchase_dt_format')
// .get(function () {
//   if (this.purchase_dt) {
//     return moment(this.purchase_dt).format('MMMM Do, YYYY');
//   }
// });

// CarSchema
// .virtual('purchase_dt_yyyy_mm_dd')
// .get(function () {
//   return moment(this.purchase_dt).format('YYYY-MM-DD');
// });

//Export model
module.exports = mongoose.model('Account', AccountSchema);