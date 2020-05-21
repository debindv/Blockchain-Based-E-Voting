const express = require('express');
const router = express.Router();
const path = require('path');
const Email = require('../models/Email');


router.get('/', (req,res) => {
    Email.find( {}, (err, data) => {
        if (err) throw err;
        else {
            res.render('verification',{data:data});
        }
    });
});

module.exports = router;