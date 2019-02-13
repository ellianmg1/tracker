var moment = require('moment');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var RepairSchema = new Schema({
  car: { type: Schema.ObjectId, ref: 'Car', required: true }, //reference to the associated car
  odoMileage: {type: Number, required: true},
  work_date: {type: Date, default: Date.now},
  part: {type: Schema.ObjectId, ref: 'Part'}, //reference to the associated Part Number
  amount: {type: SchemaTypes.Double, required: true},
  shop_loc: {type: String, required: true},
  work_desc: {type: String},
  purchased_at: {type: String, required: true},
  category: {type: String, required: true},
   
});

// Virtual for Repairs URL
RepairSchema
.virtual('url')
.get(function () {
  return '/tracker/repair/' + this._id;
});

// Virtual for total cost
RepairSchema
.virtual('total_cost')
.get(function () {
  return (this.amount * 1).toFixed(2);
});

RepairSchema
.virtual('work_dt_formatted')
.get(function () {
  return moment(this.work_date).format('DD-MMM-YY');
});

RepairSchema
.virtual('max_work_dt')
.get(function () {
  return moment(this.work_date).format('DD-MMM-YY');
});

RepairSchema
.virtual('work_dt_yyyy_mm_dd')
.get(function () {
  return moment(this.work_date).format('YYYY-MM-DD');
});

RepairSchema
.virtual('work_dt_yyyy')
.get(function () {
  return moment(this.work_date).format('YYYY');
});

RepairSchema
.virtual('curr_yyyy')
.get(function () {
  return moment().format('YYYY');
});

RepairSchema
.virtual('work_dt_future')
.get(function () {
  var wk_dt_future = '';
  if (this.work_date > moment() ) {
    wk_dt_future = 'TBD';
  }
  return wk_dt_future;
});

var RepairTotSchema = new Schema({
  totalCost: {type: SchemaTypes.Double},
});


//Export model
module.exports = mongoose.model('Repair', RepairSchema);