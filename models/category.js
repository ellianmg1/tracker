// Category Model
var mongoose = require('mongoose')
// require('mongoose-double')(mongoose);
// var moment = require('moment');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var CategorySchema = new Schema({
  name: {type: String, required: true},
  desc: {type: String, max: 100},
  notes: {type: String, max: 400},
  interval: {type: Number},  
});


// Virtual for part URL
CategorySchema
.virtual('url')
.get(function () {
  return '/tracker/category/' + this._id;
});

// CategorySchema
// .virtual('part_sht_desc')
// .get(function () {
//   return this.manuf + ' - ' + this.s_name + ' (' + this.partNum + ')';
// });


//Export model
module.exports = mongoose.model('Category', CategorySchema);