var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var LastRepairSchema = new Schema({
    _id: { car: {type: String},
      Category: {type: String} },
    maxWorkDate: {type: Date },
   lastMileage: {type: Number},
  });

LastRepairSchema
.virtual('last_work_dt_fmt')
.get(function () {
  return moment(this.maxWorkDate).format('DD-MMM-YY');
});

//Export model
module.exports = mongoose.model('LastRepair', LastRepairSchema);