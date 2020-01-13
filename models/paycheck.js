var moment = require('moment');
var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var PaycheckSchema = new Schema({
  paycheck_dt: {type: Date, default: Date.now},
  payAccount: {type: Schema.ObjectId, ref: 'Account'}, //reference to the associated Bank
  payAmount: {type: SchemaTypes.Double, required: true},
  currStatus: {type: String, required: true, enum:['Scheduled','Complete'], default:'Scheduled'},
  userid: {type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
  createTS: {type: Date, default: Date.now},
  updateTS: {type: Date, default: Date.now},
});

// Virtual for Paychecks URL
PaycheckSchema
.virtual('url')
.get(function () {
  return '/fintra/paycheck/' + this._id;
});

PaycheckSchema
.virtual('paycheck_dt_ddmmmyy')
.get(function () {
  return moment(this.paycheck_dt).format('DD-MMM-YY');
});

//Export model
module.exports = mongoose.model('Paycheck', PaycheckSchema);