const mongoose = require('../config/database');

const Event = new mongoose.Schema({
  author: String,
  title: String,
  start: Date,
  end: Date,
  allDay: Boolean,
}, { 
  timestamps: true
});

module.exports = mongoose.model('Event', Event);