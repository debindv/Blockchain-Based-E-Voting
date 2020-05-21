    const express = require('express');
const router = express.Router();
const path = require('path');
const voted = require('../models/hasVoted');




router.get('/' , (req,res) => {
    //console.log(`COINBASE FROM VOTED ${coinbase}`);
    voted.find( {}, (err, data) => {
        if (err) throw err;
        else {
            res.render('votedList',{data:data});
        }
    });
    
});

module.exports = router;