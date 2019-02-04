var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var Sequelize = require('sequelize');
var parser = require("body-parser");



router.use(parser.json());
router.use(parser.urlencoded({ extended: false}));



router.get('/', function(req, res){


   res.render('home');


});






module.exports = router;
