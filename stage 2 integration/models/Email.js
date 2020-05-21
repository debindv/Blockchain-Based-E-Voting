const mongoose = require('mongoose');


const EmailSchema = new mongoose.Schema({
  
  candidateid:{
      type: String,
      required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  
});

const User = mongoose.model('Email_details', EmailSchema);

module.exports = User;
