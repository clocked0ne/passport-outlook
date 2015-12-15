/* global describe, it, expect */
/* jshint expr: true */

var OutlookStrategy = require('../lib/strategy');


describe('Strategy', function() {
    
  var strategy = new OutlookStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    },
    function() {});
    
  it('should be named outlook', function() {
    expect(strategy.name).to.equal('outlook');
  });
  
});
