var express = require('express');
var sha1= require('sha1')
var router = express.Router();


var path= require('../config/index.js')
var config= require('./../config/index')



/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log('query:', req.query)
  var query= req.query;

  // res.render('index', { title: 'Express' });


  var signature= query.signature;
  var timestamp= query.timestamp;
  var nonce= query.nonce;

  var arr= [config.token, timestamp, nonce]
  arr.sort()
  var arrStr= arr.join('')
  var sha1Str= sha1(arrStr)

  if (signature === sha1Str) {
    res.end('echostr')
  } else {
    // res.end(false)
    res.render('index', { title: 'Express' });
  }




});

module.exports = router;
