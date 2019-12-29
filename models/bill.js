var mongoose = require('mongoose');
// var moment = require('moment'); // For date handling.
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var BillSchema = new Schema({
  payeeAccountID: {type: Schema.ObjectId, ref: 'Account', required: true }, //reference to the associated account (subset of Account schema)
  payDue_dt: {type: Date, default: Date.now},
  billAmount: {type: SchemaTypes.Double},
  currStatus: {type: String, required: true, enum:['N/A','Due','Scheduled','Complete'], default:'Due'},
  userid: {type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
  createTS: {type: Date},
  updateTS: {type: Date},
});

// Virtual for Car's URL
BillSchema
.virtual('url')
.get(function () {
  return '/fintra/bill/' + this._id;
});

// // Virtual for account's Name with '#'
// BillSchema
// .virtual('hashname')
// .get(function () {
//   return '#'+this.accountName + this.accountID + this.type;
// });

// // Virtual for account's Name with '#'
// BillSchema
// .virtual('nohashname')
// .get(function () {
//   return this.accountName + this.accountID + this.type;
// });

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

BillSchema
.virtual('payDue_dt_y_m_d')
.get(function () {
  return moment(this.payDue_dt).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('Bill', BillSchema);