var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');

var parser = require("body-parser");
var mysqlquery = require('../../database/db');


router.use(parser.json());
router.use(parser.urlencoded({ extended: true}));

router.get('/internal', function(req, res){
      res.render('internal/employeelogin', {msg:''});
});




//login
router.post('/internallogin', function(req, res){

    var userdata = {
	   username :  req.body.username,
	   pwd       :  req.body.pwd
     }

    console.log(req.body);
     if(!userdata.username  || !userdata.pwd){

       res.render('internal/employeelogin', {msg:"Username or password cannot be empty"});

     } else {
               mysqlquery('Select * from employeelogin where  username = ?', userdata.username, function(err, result) {



              if(result == ""){

                 res.render('internal/employeelogin', {msg:'Wrong username or password.'});
              } else {

                // check if it matches with the user password
                    if (userdata.pwd == result[0].pwd) {

                            var employee = 'employee';
                            req.session[employee] = userdata.username;
                            console.log(req.session);
                            res.redirect('/internaldashboard');
                      }else {

                          res.render('internal/employeelogin', {msg:"Wrong username or password"});







               }


             }
     });

}

});

router.get('/internallogout', function(req, res){

  req.session.destroy(function(err) {
  // cannot access session here
  res.redirect('/internal');
})

});


module.exports = router;
