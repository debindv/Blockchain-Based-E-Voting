const express = require('express');
var crypto = require('crypto');
const router = express.Router();
const path = require('path');
const Email = require('../models/Email');
const login = require('./login');
const fs = require('fs');
let hash=[];
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
 
//router.get('/',ensureAuthenticated, (req,res) => res.sendFile(path.join(__dirname,'../front-end','dashboard.html'))
 
 
router.get('/', ensureAuthenticated, (req,res) => {
  //Get Mail ID of the User and generate hash
  mailId = login.email;
  var mailHash = crypto.createHash('sha256').update(mailId).digest('hex');


  //Check whether the Voter has already voted
  Election.methods.hasVoted(mailHash)
    .call({ from: coinbase }).then((cond) => {

      if(!cond) {                                               //IF NOT VOTED
        Election.methods.candidatesCount()                      //DISPLAY THE CANDIDATES
          .call({ from: coinbase }).then((count) => {

            console.log(coinbase);
            for ( var i = 1; i <= count; i++ ) {
              Election.methods.getCandidate(i)
                .call({ from: coinbase }).then((val) => {
                  cid[counter] =  web3.utils.toBN(val._id).toString();
                  cname[counter] = val._name;
                  counter++;
                  
                  if(counter==count){
                    
                    counter = 0;
                    res.render('dashboard', {cid:cid, cname:cname});                //SEND THE CANDIDATE DETAILS TO DASHBOARD.EJS
                  }
              });
            }
          });
      }
      else {
        res.render('voted', {mailHash:hash[mailHash]});                                 //IF ALREADY VOTED REDIRECTS TO VOTED.EJS PAGE
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
    .send({ from: coinbase, gas:6000000, gasPrice: web3.utils.toWei('0.0000000005', 'ether') }).then((reciept) => {
      transactionHash = reciept.transactionHash;
      hash[mailHash]=transactionHash;
      console.log(reciept);
      fs.appendFile('Transaction.txt', JSON.stringify(`\n\n${reciept}`), 'utf-8',(err) => {
        if(err) throw err;
      })

      //RENDER THE SUCESS PAGE
      res.render('success', {mailHash:reciept.transactionHash});
    }).then( () => {

      //Adding mailHash and Candidate ID to a new collection
      new Email({
        transactionHash : hash[mailHash],
        candidateid : voteData
       }).save((err,doc) => {
        if (err) throw err;
        else console.log('Success')
      })
    }).catch((error) => {
      console.log(error);
    });

});







module.exports = router;