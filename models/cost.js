var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var CostSchema = new Schema({
    _id: { car: {type: String },
          year: {type: Number} },
    totalCost: {type: SchemaTypes.Double },
    count: {type: Number},
  });

//Export model
module.exports = mongoose.model('Cost', CostSchema);