const express = require('express');
const router = express.Router();
const passport = require('passport');
const admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const hasVoted = require('../models/hasVoted');
const Email = require('../models/Email');
const Aadhar = require('../models/Aadhar');
require('../config/passport')(passport); 
var Web3 = require("web3");
const HDwalletProvider = require('@truffle/hdwallet-provider');
let errors = [];
let email;

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
   
    else{
      res.redirect('/admin/login');
    }
   
  }


//Admin Login
router.get('/login', (req,res) => res.render('adminLogin'));

router.post('/login',(req, res, next) => {

    email = req.body.emailID;

   passport.authenticate('admin-local',{
       successRedirect: '/admin/dashboard',
       failureRedirect: '/admin/login',
       failureMessage: 'oopss'
   })(req,res,next);
    

  });

//Variables for voter turnout data
var ucount = 0;
var vcount = 0;
let balance;

  
//Admin Dashboard
router.get('/dashboard', ensureAuthenticated, (req,res) => {
  User.countDocuments()
    .then((no) => ucount = no)                  //Count Documents
      .then(() => hasVoted.countDocuments())
        .then((no) => vcount = no)
          .then(web3.eth.getBalance(coinbase)       //Give Balance of ethereum account
            .then((bal) => {balance = bal})
              .then(() => res.render('admin_dashboard', {ucount:ucount, vcount:vcount, errors, balance:balance})))
            
  
  // console.log(`ucount = ${ucount}`);
  // hasVoted.countDocuments().then((no) => console.log(`Voted count = ${no}`));
  
});

//Voted List
router.get('/votedList',ensureAuthenticated, (req,res) => {
  hasVoted.find( {}, (err, data) => {
    if (err) throw err;
    else {
        res.render('votedList',{data:data});
    }
});
});

//Aadhar Updation
router.get('/register', ensureAuthenticated, (req,res) => {
  res.render('register_aadhar');
});

router.post('/register', (req,res) => {
  errors = [];
  var { name,ano, email } = req.body;
  //console.log(`NAME: ${name}, ANO: ${ano},EMAIL: ${email}`);
  email = email.toLowerCase();
  name  = name.toLowerCase();
  if (!name || !email || !ano ) {
    errors.push({ msg: 'Please enter all fields' });
    res.render('register_aadhar', {
      errors,
      name,
      email,
      ano
    });
  }
  else {
  User.findOne({ email: email }).then(user => {
    if (user) {
      errors.push({ msg: 'Email already exists' });
      res.render('register_aadhar', {
        errors,
        name,
        email,
        ano
      });
    }
    else {
      Aadhar.findOne({ano: ano}).then(user => {
        if(user) {
          errors.push({ msg: 'Aadhar number already exists' });
          res.render('register_aadhar', {
            errors,
            name,
            email,
            ano
          });
        }
        else {
          new Aadhar({
            name1 : name,
            ano1 : ano,
            email1 : email
           }).save(() => {
              req.flash('success_msg', 'Successfully Added to Aadhar collection');
              console.log('Added aadhar details to Collection');
              res.redirect('/admin/dashboard');
            });
            
          }
        });
    }
  }).catch((error) => {
    console.log(error);
  });
}
});

//Download Transaction reciept
router.get('/downloadFile', ensureAuthenticated, (req,res) => {
  res.download(`./transactionreciepts/AllTransaction.txt`);
});

//Contract address
router.post('/address', (req,res) => {
  var addr = req.body.address;
  var cname = req.body.cname;
  addr = addr.trim();
  errors = [];
  if (!addr || !cname) {
    errors.push({ msg: 'Please enter all fields' });
    res.redirect('/admin/dashboard');
  }
  else if( addr != contractAddress ){
    errors.push({ msg: 'Verification of contract Address failed' });
    res.redirect('/admin/dashboard');
  }
  else {
    Election.methods.addCandidate(cname)
    .send({ from: coinbase, gas:6000000, gasPrice: web3.utils.toWei('0.00000009', 'ether')}).then((reciept) => {
      console.log(reciept);
      //RENDER THE SUCESS PAGE
      req.flash('success_msg', `Successfully Added ${cname} as a Candidate`);
      res.redirect('/admin/dashboard');
    })
    
  }
});


//Coinbase
router.post('/coinbase', (req,res) => {
  var coin = req.body.coinbase;
  var key = req.body.privatekey;
  var ccoin = req.body.ccoinbase;
  var ckey = req.body.cprivatekey;
  errors = []
  if (!coin || !key ) {
    errors.push({ msg: 'Please enter all fields' });
    res.redirect('/admin/dashboard');
  }
  else if (ccoin != coinbase || ckey!= privateKey){
    errors.push({ msg: 'Credentials do not match'});
    res.redirect('/admin/dashboard');
  }
  else {
    req.flash('success_msg', 'Successfully Updated');
    res.redirect('/admin/dashboard');
  }
});

//CLEAR DATABASE
router.get('/clearverify',ensureAuthenticated, (req,res) => {
  res.render('confirmdbaction',{db:'clearverify'});
});

router.post('/clearverify', (req,res) => {
  let password = req.body.password;
  admin.findOne({ emailID: email }, function(err, user) {
    if (err) throw err;
    if(user){
      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          //Email.deleteMany({}, () => console.log('Verification table cleared'));
          req.flash('success_msg', 'Succesfully Cleared Verification Database');
          res.redirect('/admin/dashboard');
        } else {
          req.flash('error', 'Incorrect Password');
          res.redirect('/admin/dashboard');
        }
      });
      
    }
    else{
      req.flash('error', 'User Not Found');
      res.redirect('/admin/login');
    }
    
  });
  
  
  
});

router.get('/clearhasvoted',ensureAuthenticated, (req,res) => {
  res.render('confirmdbaction',{db:'clearhasvoted'});
});

router.post('/clearhasvoted', (req,res) => {
  var password = req.body.password;
  admin.findOne({ emailID: email }, function(err, user) {
    if (err) throw err;
    if(user){
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            //hasVoted.deleteMany({}, () => console.log('Has Voted Table cleared'));
            req.flash('success_msg', 'Succesfully Cleared Verification Database');
            res.redirect('/admin/dashboard');
          } else {
            req.flash('error', 'Incorrect Password');
            res.redirect('/admin/dashboard');
          }
        });
    }
    else{
      req.flash('error', 'User Not Found');
      res.redirect('/admin/login');
    }
    
  });
});

//REMOVE USER FROM DATABASE

router.post('/removeUser', (req,res) => {
  var mail = req.body.email;
  if(!mail){
    req.flash('error', 'Email field Empty');
    res.redirect('/admin/dashboard');
  }
  else{
  User.findOne({ email: mail }, function(err, user) {
    if (err) throw err;
    if(user){
        User.deleteOne({ email: mail }, () => console.log('Deleted User'));
        req.flash('success_msg', 'Succesfully Removed User');
        res.redirect('/admin/dashboard');
    }
    else{
      req.flash('error', 'No User Found');
      res.redirect('/admin/dashboard');
    }
  });
}
  });

//COMPLETE USERS LIST

router.get('/completeList',ensureAuthenticated, (req,res) => {
  User.find( {}, (err, data) => {
    if (err) throw err;
    else {
        res.render('completeList',{data:data});
    }
});

});





module.exports = router;