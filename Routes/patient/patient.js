var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');

var parser = require("body-parser");
var mysqlquery = require('../../database/db');


router.use(parser.json());
router.use(parser.urlencoded({ extended: true}));



router.get('/registerpatient', function(req, res){


   res.render('patient/registerpatient', {msg:''});


});


//register patient route

router.post('/registerpatient', function(req, res){

   var userdata = {
	   lastName: req.body.lastname,
	   firstName :  req.body.firstname,
	   SSN       :  req.body.ssn,
	   street    :  req.body.address,
	   city      :  req.body.city,
	   state     :  req.body.state,
     zip       : req.body.zip,
	   phone     :  req.body.phone,
	   dob       :  dateFormat(req.body.dob, "isoDate"),
     gender    :  req.body.gender,
     email     : req.body.email,
   }
   console.log(userdata);
   mysqlquery('INSERT INTO patient SET ?', userdata, function(err, result) {
      if (err){
		  res.render('patient/registerpatient',{msg:'This patient is already registered with us.'});
	  }else{
	      res.render('patient/createpatientlogin', {email: userdata.email, firstName: userdata.firstName});
      }
      });

});

// patient dashboard
router.get('/patientdashboard', function(req, res){

   if(req.session['email'])
   {

     mysqlquery('Select * from patient where  email = ?',req.session['email'] , function(err, result) {
          var user = 'user';
           req.session[user] = result[0];
           res.render('patient/patientdashboard', {firstname: req.session['user'].firstName});
     });





    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

// patient dashboard profile
router.get('/patientdashboardprofile', function(req, res){

   if(req.session['email'])
   {
         console.log(req.session['email']);
          mysqlquery('Select * from patient where  email = ?',req.session['email'] , function(err, result) {

              var user = result[0];
              user.dob = dateFormat(user.dob,  "shortDate");
              var ssn = '' + user.SSN;

              user.SSN = ssn.substr(5, 4);

            res.render('patient/patientdashboardprofile',   {user: user, firstName: user.firstName } );

          });




    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

// patient dashboard tests
router.get('/patientdashboardtests', function(req, res){

   if(req.session['email'])
   {
            var user = req.session['email'];
            mysqlquery(`SELECT idPatient, testing.idTesting, orderedbyname, testname, DATE_FORMAT(testingdate,"%m-%d-%Y") as testingdate FROM patient, test, testing
            WHERE patient.idPatient = testing.patientid AND	testing.testid  = test.testid
            AND
            testing.testid = test.testid
            AND patient.email  = ?`, user, function(err, result) {
                if(result == ""){
                     res.render('patient/patientdashboardtests', {firstname: req.session['user'].firstName, result: result, msg:'You have not taken a test with us.'});
                   } else{

                        res.render('patient/patientdashboardtests', {firstname: req.session['user'].firstName, result: result, msg: ''});
                   }

             });





    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});


// patient dashboard settings
router.get('/patientdashboardsettings', function(req, res){

   if(req.session['email'])
   {

         res.render('patient/patientdashboardsettings', {firstname: req.session['user'].firstName, msg:''});



    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});


// patient dashboard result details
router.get('/patientdashboardresult/:testingid/:testname', function(req, res){

   if(req.session['email'])
   {
            var testingid = req.params.testingid;
            mysqlquery(`
              Select component,  value, DATE_FORMAT(resultdate, '%d %M %Y %H:%i:%s') AS resultdate, standardrange from result, components
            where components.idcomponents = result.componentid
            AND
            testingid = ?`, testingid, function(err, result) {
                if(result == ""){
                     res.render('patient/patientdashboardtests', {firstname: req.session['user'].firstName, result: result, msg:'Result not available yet.', testname: req.params.testname});
                   } else{

                        res.render('patient/patientdashboardresultdetail', {firstname: req.session['user'].firstName, result: result, msg: '', testname: req.params.testname});
                   }

             });





    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

// patient appointments
router.get('/patientdashboardappointment', function(req, res){

   if(req.session['email'])
   {
            var user = req.session['user'].idPatient;
            mysqlquery(`SELECT * from appointment where patientid  = ?`, user, function(err, result) {
                if(result == ""){
                     res.render('patient/patientdashboardappointment', {firstname: req.session['user'].firstName, appointment: '', msg:'No appointments scheduled.'});
                   } else{

                        result[0].appointmentdate = dateFormat(result[0].appointmentdate, "mediumDate");
                        res.render('patient/patientdashboardappointment', {firstname: req.session['user'].firstName, appointment: result, msg: ''});
                   }

             });


      } else {
        res.status(403);
        res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

      }

});

// patient dashboard book appointment
router.get('/patientdashboardbookappointment', function(req, res){

   if(req.session['email'])
   {

         res.render('patient/patientdashboardbookappointment', {firstname: req.session['user'].firstName});



    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});


// save appointment
//register patient route

router.post('/patientdashboardsaveappointment', function(req, res){

   var appointment = {
	   time: req.body.time,
	   appointmentdate :  dateFormat(req.body.date, "isoDate"),
	   location      :  req.body.location,
	   patientid    :  req.session['user'].idPatient


   }

   mysqlquery('INSERT INTO  appointment SET ?', appointment, function(err, result) {
      if (err){
		  res.render('patient/patientdashboardappointment',{msg:'Error occured.', appointment:'', firstname: req.session['user'].firstName});
	  }else{
	      res.redirect('/patientdashboardappointment');
      }
      });

});

// patient dashboard cancel appointment
router.get('/patientdashboardcancelappointment/:idappointment', function(req, res){

   if(req.session['email'])
   {
     var idappointment = req.params.idappointment;
    mysqlquery('delete from appointment where idappointment = ?', idappointment, function(err, result){

            res.redirect('/patientdashboardappointment');
    });

    } else {
      res.status(403);
      res.end('<h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

// update Profile
router.post('/updatepatientprofile', function(req, res){

   var userdata = {
	   street    :  req.body.address,
	   city      :  req.body.city,
	   state     :  req.body.state,
     zip       : req.body.zip,
	   phone     :  req.body.phone,
     email     : req.body.email,
   }
   console.log(userdata);
   mysqlquery('Update patient  SET street = ?, city = ?, state = ?, zip = ?, phone = ?, email = ? where idPatient = ? ', [userdata.street, userdata.city,
   userdata.state, userdata.zip, userdata.phone, userdata.email, req.session['user'].idPatient], function(err, result) {




	      res.redirect('/patientdashboardprofile');

      });

});







module.exports = router;
