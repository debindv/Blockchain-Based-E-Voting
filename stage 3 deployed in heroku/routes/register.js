const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Aadhar = require('../models/Aadhar');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


//router.get('/', (req,res) => res.sendFile(path.join(__dirname,'../front-end','register.html')));

//Setting up mailer
var smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
      user: "teamblockbusterinc@gmail.com",
      pass: "evoting123"
  }
});

router.get('/' ,(req,res) => res.render('register'));

router.post('/', (req, res) => {
  var { name,ano, email, password, password2 } = req.body;
  email = email.toLowerCase();
  name  = name.toLowerCase();
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  }  else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        Aadhar.findOne({ ano1: ano, name1:name, email1:email }).then(user => {
          if (user) {
            const newUser = new User({
              name,
              email,
              password
            });
    
            bcrypt.genSalt(10, (err,salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;

                //Generate random no for email verification
                
                var token = crypto.randomBytes(20).toString('hex');

                const mailOptions={
                from : 'Team Blockbusters <teamblockbusterinc@gmail.com>',
                to : email,
                subject : "De-Mocracy : Please confirm your Email account",
                text : 'Hello,\n Please Click on the link to verify your email.'+ '\n\n'+'http://' + req.headers.host + '/login/' + token + '\n' +
                'This Link will expire in 1 hour\n\n' +
                'Team Blockbusters\n'
                };  
              
         
                 //Send email
                 smtpTransport.sendMail(mailOptions, (error, response) => {
                  if(error){
                          console.log(error);
                          req.flash('error_msg', 'Registration failed');
                          res.redirect('/registration');
                  }else{
                          newUser.emailVerificationToken = token;
                          newUser.emailTokenExpiry = Date.now() + 3600000;
                          newUser.save().then( () => {
                            req.flash('success_msg', 'Please check your email to verify your Email ID and confirm registration');
                            res.redirect('/login');
                          }).catch(err => console.log(err));
                        }
                });
                
                
              });
            });
          }  
          else {
            errors.push({ msg: 'Aadhaar details do not match' });
            res.render('register', {
            errors,
            name,
            email,
            password,
            password2
         });

        }

        }); 

      }

    });

  }

});
        
      
        

      
  

module.exports = router;