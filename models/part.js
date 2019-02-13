var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var moment = require('moment');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var PartSchema = new Schema({
  car: { type: Schema.ObjectId, ref: 'Car'}, //reference to the associated car
  partNum: {type: String, required: true},
  s_name: {type: String, required: true},
  desc: {type: String, required: true, max: 100},
  qty_avl: {type: Number, default: 0},
  notes: {type: String, max: 400},
  manuf: {type: String, required: true, default: "OEM"}
});


// Virtual for part URL
PartSchema
.virtual('url')
.get(function () {
  return '/tracker/part/' + this._id;
});

PartSchema
.virtual('part_sht_desc')
.get(function () {
  return this.manuf + ' - ' + this.s_name + ' (' + this.partNum + ')';
});

PartSchema
.virtual('part_sht_name')
.get(function () {
  return this.s_name + ' (' + this.partNum + ')';
});

//Export model
module.exports = mongoose.model('Part', PartSchema);