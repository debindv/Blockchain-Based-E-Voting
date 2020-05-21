const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  
  emailID: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const admin = mongoose.model('admins', adminSchema);

module.exports = admin;
