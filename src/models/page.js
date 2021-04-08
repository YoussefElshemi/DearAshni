const mongoose = require('../config/database');

const Page = new mongoose.Schema({
  author: String,
  text: String,
  weather: String,
  mood: String
}, { 
  timestamps: true
});

module.exports = mongoose.model('Page', Page);