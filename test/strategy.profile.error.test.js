/* global describe, it, expect, before */
/* jshint expr: true, multistr: true */

var OutlookStrategy = require('../lib/strategy');


describe('Strategy#userProfile', function() {

  describe('handling API OAuth errors', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

    // mock
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://outlook.office.com/api/v2.0/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }

      var body = '{ \
           "error": { \
              "code": "request_token_expired", \
              "message": "The provided access token has expired." \
           } \
        }';

      callback({ statusCode: 401, data: body });
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('OutlookAPIError');
      expect(err.message).to.equal('The provided access token has expired.');
      expect(err.code).to.equal('request_token_expired');
    });
  });

  describe('handling API errors', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

    // mock
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://outlook.office.com/api/v2.0/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }

      var res = {
           "statusCode": 404,
           "headers": {
              "content-length": "0",
              "x-caserrorcode": "UserNotFound"
           }
        };

      callback(null, undefined, res);
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('OutlookAPIError');
      expect(err.message).to.equal('UserNotFound');
      expect(err.code).to.equal(404);
    });
  });

  describe('handling malformed responses', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

    // mock
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://outlook.office.com/Mail.Read') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }

      var res = 'Hello, world.';
      callback(null, res, undefined);
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to fetch user profile');
    });
  });

});
