const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

// Load Admin model
const admin = require('../models/admin');

function SessionConstructor(userId, userGroup, details){

  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

module.exports = function(passport) {
  passport.use( 'user-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email.toLowerCase()
      }).then(user => {
        if (!user) {
          return done(null, false);
        }



        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if(!user.verified){
            return done(null, false,{ message: 'Email not verified' });
          }
          if (isMatch) {
            user.emailVerificationToken = undefined; 
            user.emailTokenExpiry = undefined;
            user.save();
            return done(null, user);
          } else {
            return done(null, false,{ message: 'Incorrect login credentials' });
          }
        });
      });
    })
  );


  passport.use( 'admin-local',
  new LocalStrategy({usernameField: 'emailID'}, (emailID,password,done) => {
    admin.findOne({
      emailID: emailID
    }).then(user => {
      if (!user) {
        return done(null, false);
      }
      

       // Match password
       bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          
          return done(null, user);
        } else {
          
          return done(null, false,{ message: 'Password incorrect' });
        }
      });
    });
  })
);

  passport.serializeUser(function(userObject, done) {
    let userGroup = "model1";
    let userPrototype = Object.getPrototypeOf(userObject);

    if(userPrototype === User.prototype){
      userGroup = "model1";

    } else if (userPrototype === admin.prototype){
      userGroup = "model2";
    }

    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
    done(null,sessionConstructor);
  });

  passport.deserializeUser(function (sessionConstructor, done) {

    if (sessionConstructor.userGroup == 'model1') {
      User.findOne({
          _id: sessionConstructor.userId
      }, function (err, user) { 
          done(err, user);
      });
    } else if (sessionConstructor.userGroup == 'model2') {
      admin.findOne({
          _id: sessionConstructor.userId
      }, function (err, user) { 
          done(err, user);
      });
    } 

  });

};






