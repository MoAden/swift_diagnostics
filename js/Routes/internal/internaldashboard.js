var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');

var parser = require("body-parser");
var mysqlquery = require('../../database/db');

router.use(parser.json());
router.use(parser.urlencoded({ extended: true}));

// patient dashboard
router.get('/internaldashboard', function(req, res){

   if(req.session['employee'])
   {

          res.render('internal/employeedashboard');



    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});
router.get('/internalpatient', function(req, res){

   if(req.session['employee'])
   {
          var result = [];
          res.render('internal/employeedashboardsearchpatient', {msg:'', result: '', msg2:''});



    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});
router.get('/internalresult', function(req, res){

   if(req.session['employee'])
   {
          var result = [];
          res.render('internal/employeedashboardresult', {msg:'', result: ''});



    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

router.post('/internalpatientsearch', function(req, res){

  console.log(req.body);
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

   if(req.session['employee'])
   {



          mysqlquery('select idPatient,DATE_FORMAT(dob,"%m-%d-%Y") AS dob, SSN, firstName, LastName from patient where firstName = ? and lastName = ?', [firstname, lastname], function(err, result) {
           if(result == ""){
                res.render('internal/employeedashboardsearchpatient', {msg: 'Patient does not exist', result:'', msg2:''});
              } else{

                res.render('internal/employeedashboardsearchpatient', {result: result, msg:'', msg2:''});
              }

        });
    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

// patient test
router.get('/internalpatienttest/:id', function(req, res){

    var patientid = req.params.id;
   if(req.session['employee'])
   {


  // retreive tests from test table
    mysqlquery('select * from test ', function(err, result) {

          console.log(req.session['patient']);

           res.render('internal/employeedashboardtest', {test: result, patientid: patientid, msg:''});
    });

    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }



});

//save test
router.post('/internalpatienttestsave', function(req, res){

   var userdata = {
	   patientid: req.body.patientid,
	   testid :  req.body.testid,
	   orderby :  req.body.orderedby,
     orderedbyname:  req.body.orderedbyname,
     address:      req.body.address,
	   city   :  req.body.city,
	   state     :  req.body.state,
     zip       : req.body.zip,
     location: req.body.location
   }
   console.log(userdata);
   mysqlquery('INSERT INTO testing SET ?', userdata, function(err, result) {
      if (err){
		  res.render('internal/employeedashboardsearchpatient',{msg:'Testing not saved. ', result: '', msg2:''});
	  }else{
	      res.render('internal/employeedashboardsearchpatient',{msg2:'Test was saved successfully. ', msg:'', result:''});
      }
      });

});

// specimen
router.get('/internalspecimen', function(req, res){

   if(req.session['employee'])
   {
          var result = [];
          res.render('internal/employeedashboardspecimen', {msg:'', result: ''});



    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});

//search test for Specimen
router.post('/internaltestingsearch', function(req, res){


    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

   if(req.session['employee'])
   {




          mysqlquery(`SELECT idPatient, idTesting, firstName, lastName, DATE_FORMAT(dob,"%m-%d-%Y") as dob, SSN, testing.testid, testname, testtype, DATE_FORMAT(testingdate,"%m-%d-%Y") as testingdate FROM patient, test, testing WHERE patient.idPatient = testing.patientid AND	testing.testid  = test.testid
AND
	patient.firstName = ?
AND patient.lastName  = ?`, [firstname, lastname], function(err, result) {
            console.log(result.length);
           if(result == ""){
                res.render('internal/employeedashboardspecimen', {msg: 'No tests found for such patient', result:''});
              } else{

                   res.render('internal/employeedashboardspecimen', {result: result, msg:''});
              }

        });
    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});


//insert specimen

router.get('/internalpatientspeciment/:patientid/:testingid', function(req, res){

    var patientid = req.params.patientid;
    var testingid = req.params.testingid;

   if(req.session['employee'])
   {

           res.render('internal/insertspecimenform', {testingid: testingid, patientid: patientid, msg:''});


    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }



});

//save specimen
router.post('/internalspecimensave', function(req, res){

   var userdata = {
	   donorid: req.body.patientid,
	   testingid :  req.body.testingid,
	   specimenid :  req.body.specimenid,
     collectedby:  req.body.collectedby,

   }
   console.log(userdata);
   mysqlquery('INSERT INTO specimen SET ?', userdata, function(err, result) {
      if (err){
		  res.render('internal/employeedashboardspecimen',{msg:'Specimen not saved to the database. ', result:''});
	  }else{
	      res.render('internal/employeedashboardspecimen',{msg:'Specimen was saved successfully. ', result:''});
      }
      });

});


router.post('/internalspecimensearch', function(req, res){

  console.log(req.body);
    var  specimenid = req.body.specimenid;


   if(req.session['employee'])
   {


          mysqlquery(`SELECT specimenid, idPatient, testingid, firstName, lastName, testing.testid, testname, testtype, DATE_FORMAT(testingdate,"%m-%d-%Y") as testingdate
          FROM specimen, patient, test, testing
           WHERE patient.idPatient = specimen.donorid
            AND specimen.testingid  = testing.idTesting
            AND
                  testing.testid = test.testid
            AND
	          specimen.specimenid = ?`, specimenid, function(err, result) {
           if(result == ""){
                res.render('internal/employeedashboardresult', {msg: 'SpecimenID does not exist.', result:''});
              } else{

                   res.render('internal/employeedashboardresult', {result: result, msg:''});
              }

        });
    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }


});
//insert result
router.get('/internalresultform/:patientid/:testingid/:specimenid', function(req, res){

    var patientid = req.params.patientid;
    var testingid = req.params.testingid;
    var specimenid = req.params.specimenid;

   if(req.session['employee'])
   {

           res.render('internal/insertresultform', {testingid: testingid, patientid: patientid, specimenid:specimenid});


    } else {
      res.status(403);
      res.end('<h1><h1> Forbidden</h1><h2>Unauthorized access</h2>');

    }



});
//save result
//save specimen
router.post('/internalsaveresult', function(req, res){

   var userdata = {
	   donorid: req.body.patientid,
	   testingid :  req.body.testingid,
	   specimenid :  req.body.specimenid,
     component:  req.body.component,
     value : req.body.value,
     techName: req.body.techName

   }
   console.log(userdata);
   mysqlquery('INSERT INTO result SET ?', userdata, function(err, result) {
      if (err){
		  res.send('Error occured.');
	  }else{
	      res.send(`<p> Component: ${userdata.component} Value: ${userdata.value}`);
      }
      });

});







module.exports = router;
