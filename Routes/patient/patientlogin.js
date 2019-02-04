var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var parser = require("body-parser");
var mysqlquery = require('../../database/db');


router.use(parser.json())
router.use(parser.urlencoded({ extended: true }));



router.get('/patientlogin', function(req, res){
      res.render('patient/patientlogin', {msg:''});
});



//login
router.post('/patientlogin', function(req, res){

    var userdata = {
	   username :  req.body.username,
	   pwd       :  req.body.pwd
     }

    console.log(req.body);
     if(!userdata.username  || !userdata.pwd){

       res.render('patient/patientlogin', {msg:"Username or password cannot be empty"});

     } else {
               mysqlquery('Select * from patientlogin where  email = ?', userdata.username, function(err, result) {



              if(result == ""){

                 res.render('patient/patientlogin', {msg:'Wrong username or password.'});
              } else {

                // check if it matches with the user password
               bcrypt.compare(userdata.pwd, result[0].pwd , function(err, matches) {

                   if(matches) {
                     console.log(req.session);

                     var email = 'email';
                     req.session[email] = userdata.username;
                     console.log(req.session);
                     res.redirect('/patientdashboard');
                   }else {

                     res.render('patient/patientlogin', {msg:"Wrong username or password"});
                   }
                 });



              }




             });
     }





});







// create login for patient
router.post('/createpatientlogin', function(req, res){

   var userdata = {

	   email :  req.body.email,
	   pwd       :  req.body.pwd
   }


   if(userdata.email && userdata.pwd){
     // hash password before storing in the database
       var salt = bcrypt.genSalt(8, function(err, salt){
         bcrypt.hash(userdata.pwd, salt, null, function(err, hash) {
        // Store hash in your password DB.
              userdata.pwd = hash;
              mysqlquery('INSERT INTO patientlogin SET ?', userdata, function(err, result) {
               if (err) {
                 if(err.code == 'ER_DUP_ENTRY' || err.errno == 1062)
                     {
                         res.send("user exists");

                     }
             } else{
              res.render(`patient/patientlogin`, {msg:'Account created. Please use your email and password to login.'});
             }

         });
    });

       });
   } else {
     res.send('data is missing');
   }



});

router.post('/patientchangepassword', function(req, res){

   var userdata = {

	   pwd       :  req.body.pwd
   }


   if(userdata.pwd){
     // hash password before storing in the database
       var salt = bcrypt.genSalt(8, function(err, salt){
         bcrypt.hash(userdata.pwd, salt, null, function(err, hash) {
        // Store hash in your password DB.
              userdata.pwd = hash;
              mysqlquery('update patientlogin set pwd  = ? where email = ?', [userdata.pwd, req.session['user'].email], function(err, result) {

              res.render(`patient/patientdashboardsettings`, {msg:'Password changed successfully.', firstname: req.session['user'].firstName});
            });

         });
    });



   } else {
     res.send('passowrd cannot be empty');
   }



});






router.get('/patientlogout', function(req, res){

  req.session.destroy(function(err) {
  // cannot access session here
  res.redirect('/');
})

});










module.exports = router;
