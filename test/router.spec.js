'use strict';
var restify = require('restify');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var request = require('supertest');
var Router = require('../lib/router');

describe('Restify Router', function () {

  var server;

  beforeEach(function () {

    server = restify.createServer();
    server.use(restify.queryParser());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.bodyParser());

  });

  describe('Simple unnamed routes', function () {
    it('Should add simple GET route to server', function (done) {

      var router = new Router();

      router.get('/hello', function (req, res, next) {
        res.send('Hello World');
        next();
      });

      router.applyRoutes(server);

      request(server)
        .get('/hello')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('Hello World');
          done();
        });

    });

    it('Should add simple GET route with prefix to server', function (done) {

      var router = new Router();

      router.get('/world', function (req, res, next) {
        res.send('Hello World');
        next();
      });

      router.applyRoutes(server,'/hello');

      request(server)
        .get('/hello/world')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('Hello World');
          done();
        });

    });

    it('Should add simple regex GET route to server', function (done) {

      var router = new Router();

      router.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
        res.send(req.params[0] + '-' + req.params[1]);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .get('/hello/test')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('hello-test');
          done();
        });

    });

    it('Should add simple POST route to server', function (done) {

      var router = new Router();

      router.post('/postme', function (req, res, next) {
        res.send(req.body.name);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .post('/postme')
        .set('Content-Type', 'application/json')
        .send({name: 'test'})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('test');
          done();
        });

    });

    it('Should add simple PUT route to server', function (done) {
      var router = new Router();

      router.put('/puttme', function (req, res, next) {
        res.send(req.body.name);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .put('/puttme')
        .set('Content-Type', 'application/json')
        .send({name: 'test'})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('test');
          done();
        });

    });

    it('Should add simple DELETE route to server', function (done) {
      var router = new Router();

      router.del('/deleteme/:id', function (req, res, next) {
        res.send(req.params.id);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .del('/deleteme/2')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('2');
          done();
        });

    });

    it('Should add simple PATCH route to server', function (done) {
      var router = new Router();

      router.patch('/patchme', function (req, res, next) {
        res.send(req.body.name);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .patch('/patchme')
        .set('Content-Type', 'application/json')
        .send({name: 'test'})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('test');
          done();
        });

    });

    it('Should add simple HEAD route to server', function (done) {
      var router = new Router();

      router.head('/head', function (req, res, next) {
        res.header('x-test', 'testing');
        res.send(200);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .head('/head')
        .expect(200)
        .expect('x-test', 'testing')
        .end(done);

    });

    it('Should add simple OPTIONS route to server', function (done) {
      var router = new Router();

      router.opts('/opts', function (req, res, next) {
        res.header('Allow', 'GET,POST,OPTIONS');
        res.send(200);
        next();
      });

      router.applyRoutes(server);

      request(server)
        .options('/opts')
        .expect(200)
        .expect('Allow', 'GET,POST,OPTIONS')
        .end(done);
    });

  });

  describe('Complex route definitions', function () {

    it('Should add a named route', function (done) {
      var router = new Router();

      router.get({name: 'hello', path: '/hello'}, function (req, res, next) {
        res.send('Hello World');
        next();
      });

      router.applyRoutes(server);

      request(server)
        .get('/hello')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('Hello World');
          done();
        });

    });

    it('Should add versioned routes', function (done) {
      var router = new Router();

      router.get({path: '/hello', version: '1.0.0'}, function (req, res, next) {
        res.send('1.0.0');
        next();
      });

      router.get({path: '/hello', version: '2.0.0'}, function (req, res, next) {
        res.send('2.0.0');
        next();
      });

      router.applyRoutes(server);

      request(server)
        .get('/hello')
        .set('Accept-Version', '~2')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.should.equal('2.0.0');
          done();
        });

    });

  });

  describe('Failure cases', function () {

    it('Should fail if invalid path type is provided', function () {

      function fail() {
        var router = new Router();

        router.get(true, function (req, res, next) {
          //fails
          res.send(200);
        });
      }

      /* jshint ignore:start */
      expect(fail).to.throw('path (string) required');
      /* jshint ignore:end */
    });

    it('Should fail if no handler is provided', function () {

      function fail() {
        var router = new Router();

        router.get('test');
      }

      /* jshint ignore:start */
      expect(fail).to.throw('handler (function) required');
      /* jshint ignore:end */
    });

  });

  afterEach(function () {
    server.close();
  });
});
