const mongoose = require('../config/database');

const Task = new mongoose.Schema({
  author: String,
  task: String,
  complete: Boolean,
}, { 
  timestamps: true
});

module.exports = mongoose.model('Task', Task);