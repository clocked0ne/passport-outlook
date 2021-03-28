/* global describe, it, before, expect */
/* jshint expr: true, multistr: true */

var OutlookStrategy = require('../lib/strategy');

describe('Strategy#userProfile', function() {
    
  describe('fetched from default endpoint', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function verify(){});
    
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://outlook.office.com/api/v2.0/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }
    /*
    {
    "Id": "",
    "EmailAddress": "",
    "DisplayName": "",
    "Alias": "AllieB",
    "MailboxGuid": ""
}
    */
      var body = '{ \
         "Id": "0dbf6616-20bd-4cbd-860d-47c5b7953e76@c512ffd1-581d-4dc0-a672-faee32f6387c", \
         "EmailAddress": "AllieB@oauthplay.onmicrosoft.com", \
         "DisplayName": "Allie Bellew", \
         "Alias": "AllieB", \
         "MailboxGuid": "8d899a1e-bde4-4946-8817-005e6f11d36d" \
      }';
  
      callback(null, body);
    };
    
    
    var profile;
  
    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });
  
    it('should parse profile', function() {
      expect(profile.provider).to.equal('windowslive');
    
      expect(profile.id).to.equal('0dbf6616-20bd-4cbd-860d-47c5b7953e76@c512ffd1-581d-4dc0-a672-faee32f6387c');
      expect(profile.emails[0].type).to.equal('home');
      expect(profile.emails[0].value).to.equal('AllieB@oauthplay.onmicrosoft.com');
      expect(profile.displayName).to.equal('Allie Bellew');
      expect(profile.alias).to.equal('AllieB');
      expect(profile.mailboxGuid).to.equal('8d899a1e-bde4-4946-8817-005e6f11d36d');
    });
  
    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });
  
    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint
  
  describe('error caused by invalid token', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});
    
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{\r   "error": {\r      "code": "request_token_invalid", \r      "message": "The access token isn\'t valid."\r   }\r}';
      callback({ statusCode: 401, data: body });
    };
      
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('invalid-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('OutlookAPIError');
      expect(err.message).to.equal("The access token isn't valid.");
      expect(err.code).to.equal('request_token_invalid');
    });
  }); // error caused by invalid token
  
  describe('error caused by malformed response', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function verify(){});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, undefined, body);
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
      expect(err.message).to.equal('Failed to parse user profile');
    });
  }); // error caused by malformed response
  
  describe('internal error', function() {
    var strategy =  new OutlookStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function verify(){});
    
    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    }
    
    
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
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });
    
    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error
  
});