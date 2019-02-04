var request = require("supertest");
var expect = require('chai').expect;
var rewire = require('rewire');
var app = rewire('../app');


it("Loads the home page", function(done) {
        request(app).get("/").expect(400).end(done);
    });


it("GETS Patient Login", function(done) {
            request(app).get("/patientlogin").expect(400).end(done);
        });

 it("POSTS Patient Login", function(done) {
            request(app)
               .post("/patientlogin")
               .send({ "username": "nimne", "pwd": "MKjj"})
               .expect(400)
               .end(done);
        });

  it("Loads internaldashboard", function(done) {
                request(app).get("/patientdashboard").expect(200).end(done);
            });


  it("GETS internal Login", function(done) {
              request(app).get("/internal").expect(400).end(done);
    });


  it("GETS Register Patient", function(done) {
        request(app).get("/registerpatient").expect(400).end(done);
      });

  it("GETS internal Dashboard", function(done) {
            request(app).get("/internaldashboard").expect(200).end(done);
  });
