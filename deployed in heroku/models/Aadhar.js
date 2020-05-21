const mongoose = require('mongoose');


const AadharSchema = new mongoose.Schema({
  name1: {
    type: String,
    required: true
  },
  ano1:{
      type: Number,
      required: true
  },
  email1: {
    type: String,
    required: true
  },
  // password1: {
  //   type: String,
  //   required: true
  // }
});

const Aadhar = mongoose.model('Aadhar_details', AadharSchema);

module.exports = Aadhar;
