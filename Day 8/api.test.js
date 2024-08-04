// const chai = require('chai');
// const chaiHttp = require('chai-http');
const app = require('./server'); // Assuming your main server file is named server.js
const mongoose = require('mongoose');
// const User = require('../models/User'); // Adjust the path as necessary

chai.use(chaiHttp);
const expect = chai.expect;

describe('User API', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /register', () => {
    it('should register a new user', (done) => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        age: 25
      };
      chai.request(app)
        .post('/register')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('name', 'Test User');
          done();
        });
    });

    it('should not register a user with an existing email', (done) => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        age: 25
      };
      chai.request(app)
        .post('/register')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should login a user with valid credentials', (done) => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'password123'
      };
      chai.request(app)
        .post('/login')
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not login a user with invalid credentials', (done) => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      };
      chai.request(app)
        .post('/login')
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });
});
