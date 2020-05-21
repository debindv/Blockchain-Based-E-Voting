const express = require('express');
const router = express.Router();
const passport = require('passport');

require('../config/passport')(passport); 
 
 
router.get('/', (req,res) => res.render('login'));
 
router.post('/',(req, res, next) => {
 
    module.exports.email = req.body.email;
    passport.authenticate('user-local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  });
 
 
 
 
module.exports = router;