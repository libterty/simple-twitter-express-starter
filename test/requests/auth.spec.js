process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const nanoid = require('nanoid');
const sinon = require('sinon');
const app = require('../../app');
const should = chai.should();
const expect = chai.expect;
const bcrypt = require('bcrypt-nodejs');
// import fake data and function for testing
const { adminOne, userOne, setupDatabase } = require('../fixtures/db');
const db = require('../../models/');
// wipe out user collection and create userOne before every tests
beforeEach(setupDatabase);

describe('# auth request', () => {
  context('# signup', () => {
    describe('Sending invalid user signup infromation', () => {
      it('will redirect to /signup with existing username', done => {
        chai
          .request(app)
          .post('/signup')
          .type('form')
          .send({
            _method: 'post',
            name: `test1`,
            email: `${nanoid(5)}@example.com`,
            password: '12345678',
            passwordCheck: '12345678'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });

      it('will redirect to /signup with existing email', done => {
        chai
          .request(app)
          .post('/signup')
          .type('form')
          .send({
            _method: 'post',
            name: `test2`,
            email: `test1@example.com`,
            password: '12345678',
            passwordCheck: '12345678'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });

      it('will redirect to /signup with insufficient password length', done => {
        chai
          .request(app)
          .post('/signup')
          .type('form')
          .send({
            _method: 'post',
            name: `test3`,
            email: `test3@example.com`,
            password: '123',
            passwordCheck: '123'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });

      it('will redirect to /signup with passwordCheck err', done => {
        chai
          .request(app)
          .post('/signup')
          .type('form')
          .send({
            _method: 'post',
            name: `test3`,
            email: `test3@example.com`,
            password: '12345678',
            passwordCheck: '124231423'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });
    });

    describe('Sending valid user signup information', () => {
      it('will show error_messages', done => {
        chai
          .request(app)
          .post('/signup')
          .type('form')
          .send({
            _method: 'post',
            name: `${nanoid(5)}`,
            email: `${nanoid(5)}@example.com`,
            password: '12345678',
            passwordCheck: '12345678'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.type).to.eq('text/html');
            expect(res.redirects[0]).not.to.undefined;
            return done();
          });
      });
    });
  });

  context('# signin', () => {
    describe('Sending invalid user signin information', () => {
      it('will redirect to /signin if email not exists', done => {
        chai
          .request(app)
          .post('/signin')
          .type('form')
          .send({
            email: 'abc@example.com',
            password: userOne.password
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });
      it('will redirect to /signin if password incorrect', done => {
        chai
          .request(app)
          .post('/signin')
          .type('form')
          .send({
            email: userOne.email,
            password: '1011001111'
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });
    });
    describe('Sending valid user signin information', () => {
      it('will redirect to / if user information matches', done => {
        chai
          .request(app)
          .post('/signin')
          .type('form')
          .send({
            email: adminOne.email,
            password: adminOne.password
          })
          .end(function(err, res) {
            if (err) return done(err);
            expect(res).to.redirectTo(res.redirects[0]);
            return done();
          });
      });
    });
  });

  context('# logout', () => {
    describe('sending logout request', () => {
      it('should logout user', done => {
        chai
          .request(app)
          .get('/logout')
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.type).to.eq('text/html');
            expect(res.redirects[0]).not.to.undefined;
          });
      });
    });
  });
});
