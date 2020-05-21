const mongoose = require('mongoose');

const Voted = new mongoose.Schema({
  
  email: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
});

const hasVoted = mongoose.model('hasVoted', Voted);

module.exports = hasVoted;
