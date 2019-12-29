var moment = require('moment');
var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var TransactionSchema = new Schema({
  payFromAccount: {type: Schema.ObjectId, ref: 'Account'}, //reference to the associated Bank
  payeeAccount: {type: Schema.ObjectId, ref: 'Account', required: true }, //reference to the associated account (subset of Bank schema)
  // payDue_dt: {type: Date, default: Date.now},
  payment_dt: {type: Date, default: Date.now},
  payAmount: {type: SchemaTypes.Double, required: true},
  billID: {type: Schema.ObjectId, ref: 'Bill'}, //reference to the associated Bill
  // submit_dt: {type: Date, default: Date.now},
  currStatus: {type: String, required: true, enum:['N/A','Due','Scheduled','Complete'], default:'Due'},
  // type: {type: String, required: true, enum:['Credit', 'Debit']},
  userid: {type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
  createTS: {type: Date, default: Date.now},
  updateTS: {type: Date, default: Date.now},
});

// Virtual for Transactions URL
TransactionSchema
.virtual('url')
.get(function () {
  return '/fintra/transaction/' + this._id;
});

// TransactionSchema
// .virtual('due_dt_ddmmmyy')
// .get(function () {
//   return moment(this.payDue_dt).format('DD-MMM-YY');
// });

TransactionSchema
.virtual('payment_dt_ddmmmyy')
.get(function () {
  return moment(this.payment_dt).format('DD-MMM-YY');
});

// TransactionSchema
// .virtual('due_dt_yyyymmdd')
// .get(function () {
//   return moment(this.payDue_dt).format('YYYY-MM-DD');
// });

TransactionSchema
.virtual('payment_dt_yyyymmdd')
.get(function () {
  return moment(this.payment_dt).format('YYYY-MM-DD');
});

// TransactionSchema
// .virtual('dt_scheduled_yyyymmdd')
// .get(function () {
//   return moment(this.submit_dt).format('YYYY-MM-DD');
// });

// TransactionSchema
// .virtual('dt_scheduled_ddmmmyy')
// .get(function () {
//   return moment(this.submit_dt).format('DD-MMM-YY');
// });

// TransactionSchema
// .virtual('due_dt_yyyy')
// .get(function () {
//   return moment(this.payDue_dt).format('YYYY');
// });

// TransactionSchema
// .virtual('curr_yyyy')
// .get(function () {
//   return moment().format('YYYY');
// });

// TransactionSchema
// .virtual('due_dt_future')
// .get(function () {
//   var due_dt_future = '';
//   if (this.payDue_dt > moment() ) {
//     due_dt_future = 'TBD';
//   }
//   return due_dt_future;
// });

//Export model
module.exports = mongoose.model('Transaction', TransactionSchema);