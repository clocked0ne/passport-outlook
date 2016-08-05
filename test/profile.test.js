/* global describe, it, expect, before */
/* jshint expr: true */

var fs = require('fs')
  , parse = require('../lib/profile').parse;


describe('profile.parse', function() {
    
  describe('example profile', function() {
    var profile;
    
    before(function(done) {
      fs.readFile('test/data/example.json', 'utf8', function(err, data) {
        if (err) { return done(err); }
        profile = parse(data);
        done();
      });
    });
    
    it('should parse profile', function() {
      expect(profile.Id).to.equal('0dbf6616-20bd-4cbd-860d-47c5b7953e76@c512ffd1-581d-4dc0-a672-faee32f6387c');
      expect(profile.EmailAddress).to.equal('AllieB@oauthplay.onmicrosoft.com');
      expect(profile.DisplayName).to.equal('Allie Bellew');
      expect(profile.Alias).to.equal('AllieB');
      expect(profile.MailboxGuid).to.equal('8d899a1e-bde4-4946-8817-005e6f11d36d');
    });
  });
  
});
