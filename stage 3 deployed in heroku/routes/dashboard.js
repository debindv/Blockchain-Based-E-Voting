const express = require('express');
var crypto = require('crypto');
const router = express.Router();
const path = require('path');
const Email = require('../models/Email');
const User = require('../models/User');
const login = require('./login');
const voted = require('../models/hasVoted');
let hash=[];
var nodemailer = require('nodemailer');
const accountSid = 'AC720dd0cea060426d8902c66068d5fe47';
const authToken = '2ebe506e4a218bedc537e4e1e07006a0';
var client = require('twilio')(accountSid,authToken);
const fs = require('fs');
// To ensure authentication

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
   
    else{
      res.redirect('/login');
    }
   
  }
 
 
  var cid=[];
  var cname = [];
  var counter = 0;
 
router.get('/downloadFile', ensureAuthenticated, (req,res) => {
  mailId = login.email;
  
  var mailHash = crypto.createHash('sha256').update(mailId).digest('hex');
  var tHash;
        //db.Email.find({ mHash:mailHash})
        Email.findOne({ mHash:mailHash }).then(user => {
          if(user){
            tHash=user.transactionHash;
            fs.access('./transactionreciepts/Transaction${tHash}.txt', fs.F_OK, (err) => {
              if (err) {
                req.flash('error','File Expired');
                res.render('voted', {mailHash:tHash});    //IF ALREADY VOTED REDIRECTS TO VOTED.EJS PAGE
              }
              else{
                res.download(`./transactionreciepts/Transaction${tHash}.txt`);
              }
            });
          }
        });    
});
 
 
router.get('/', ensureAuthenticated, (req,res) => {

  //Get Mail ID of the User and generate hash
  mailId = login.email;
  var mailHash = crypto.createHash('sha256').update(mailId).digest('hex');
  let question;

  //Check whether the Voter has already voted
  Election.methods.hasVoted(mailHash)
    .call({ from: coinbase }).then((cond) => {

      if(!cond) {  
        Election.methods.getQuestion()
        .call({ from: coinbase }).then((q) => {
            question = q;
        });                                             //IF NOT VOTED
        Election.methods.candidatesCount()                      //DISPLAY THE CANDIDATES
          .call({ from: coinbase }).then((count) => {
            for ( var i = 1; i <= count; i++ ) {
              Election.methods.getCandidate(i)
                .call({ from: coinbase }).then((val) => {
                  cid[counter] =  web3.utils.toBN(val._id).toString();
                  cname[counter] = val._name;
                  counter++;
                  
                  if(counter==count){
                    
                    counter = 0;
                    res.render('dashboard', {cid:cid, cname:cname, question: question});                //SEND THE CANDIDATE DETAILS TO DASHBOARD.EJS
                  }
              });
            }
          });
      }
      else {
        var tHash;
        //db.Email.find({ mHash:mailHash})
        Email.findOne({ mHash:mailHash }).then(user => {
          if(user){
            tHash=user.transactionHash;
            res.render('voted', {mailHash:tHash});    //IF ALREADY VOTED REDIRECTS TO VOTED.EJS PAGE
          }
          else{
            req.flash('error','Transaction Hash Missing');
            res.redirect('/login');
          }
        });
        //res.render('voted', {mailHash:hash[mailHash]});
                                        
      }
    });
});  


router.post('/', function(req, res, next) {

  var voteData = req.body.selectpicker;

  //Get Mail ID of the User and generate hash
  mailId = login.email;
  var mailHash = crypto.createHash('sha256').update(mailId).digest('hex');
  //SEND THE VOTING DETAILS TO BLOCKCHAIN NETWORK
  let transactionHash;
  Election.methods.vote(voteData, mailHash)
    .send({ from: coinbase, gas:6000000, gasPrice: web3.utils.toWei('0.00000009', 'ether')}).then((reciept) => {
      transactionHash = reciept.transactionHash;
      hash[mailHash]=transactionHash;
      console.log(reciept);
      fs.appendFile('./transactionreciepts/AllTransaction.txt', `\n`+JSON.stringify(reciept)+`\n`, 'utf-8',(err) => {
        if(err) throw err;
      })
      fs.writeFile(`./transactionreciepts/Transaction${transactionHash}.txt`, JSON.stringify(reciept), 'utf-8',(err) => {
        if(err) throw err;
      })

      //RENDER THE SUCESS PAGE
      res.render('success', {mailHash:reciept.transactionHash});
    }).then( () => {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'teamblockbusterinc@gmail.com',
          pass: 'evoting123'
        }
      });
      var mailOptions = {
        to: mailId,
        from: 'Team Blockbusters <teamblockbusterinc@gmail.com>',
        subject: 'Successfully Casted Your Vote',
        text: 'Dear Voter,\n\n' +
          'This is a confirmation that your vote has been successfully casted.\nYou can verify your vote in\n\n'+
          'http://' + req.headers.host + '/verification \n\nTeam Blockbusters\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success_msg', 'Successfully casted your vote');
      });
  //     User.findOne({ email: mailId }, function(err, user) {
  //       if (user) {
  //     client.messages.create({
  //       from: 'whatsapp:+14155238886',
  //       to: 'whatsapp:+91'+user.pno,
  //       body: 'Dear Voter,\nYour Vote has been succesfully Casted. Thank You.\n\nTeam Blockbusters'
  //     }).then(message => console.log(message.sid));
  //   }
  // });
      //d = new Date();
      //Adding the voter to voted collection
      new voted({
        email: mailId,
       // date : d
      }).save((err, doc) => {
        if (err) throw err;
        else console.log("Added MailID to VOTED list");
      })
      //Adding transactionHash and Candidate ID to a new collection
      new Email({
        transactionHash : hash[mailHash],
        candidateid : voteData,
        mHash : mailHash
       }).save((err,doc) => {
        if (err) throw err;
        else console.log('Added Transaction hash to Collection')
      })
    }).catch((error) => {
      console.log(error);
    });

});






module.exports = router;