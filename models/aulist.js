const mongoose = require('mongoose');

const AulistSchema = new mongoose.Schema({
  email  : {
    type: String,
    required: true 
  },
  auid : {
    type : String,
    required : true
  },
  hindex : {
    type: String
  },
  coauthors : {
    type: String
  },
  documents : {
    type: String
  },
  citedby : {
    type: String
  },
  citations : {
    type : String
  }
});

const Aulist = mongoose.model('Aulist', AulistSchema);

module.exports = Aulist;