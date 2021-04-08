const mongoose = require('../config/database');
const crypto = require('crypto');

const User = new mongoose.Schema({
  username: { 
    type: String, 
    lowercase: true, 
    unique: true
  },
  hash: String,
  salt: String
}, { 
  timestamps: true
});

User.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
  

User.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

module.exports = mongoose.model('User', User);