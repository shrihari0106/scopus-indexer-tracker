const mongoose = require('mongoose');

const PublistSchema = new mongoose.Schema({
  email  : {
    type: String,
    required: true 
  },
  title : {
    type: String
  },
  publisher : {
    type: String
  },
  type : {
    type: String
  },
  date : {
    type: String
  },
  citedby : {
    type : String
  },
  authors : {
    type: Array
  }
});

const Publist = mongoose.model('Publist', PublistSchema);

module.exports = Publist;