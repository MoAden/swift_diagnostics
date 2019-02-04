var express = require("express");
var app = express();



var path = require('path');
var bcrypt = require('bcrypt-nodejs');

app.use(require('cookie-parser')());
// using express-session
app.use(require('express-session')({

        name: '_es_demo', // The name of the cookie
        secret: '1234', // The secret is required, and is used for signing cookies
        resave: false, // Force save of session for each request.
        saveUninitialized: false, // Save a session that is new, but has not been modified
        maxAge : new Date(Date.now() + 5000) //5 minutes

    }));



app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));


app.use(require('./Routes/index.js'));
app.use(require('./Routes/patient/patientlogin.js'));
app.use(require('./Routes/patient/patient.js'));
app.use(require('./Routes/internal/employeelogin.js'));
app.use(require('./Routes/internal/internaldashboard.js'));




console.log("server started");

//error handling
app.use((err, req, res, next) => {

  console.error(err.stack);
  res.status(500).send(`Red alert! Red alert: ${err.stack}`);

});



app.listen(80);
module.exports = app;
