/* global describe, it, expect */
/* jshint expr: true */

var OutlookStrategy = require('../lib/strategy');


describe('Strategy', function() {
    
  var strategy = new OutlookStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    },
    function() {});
    
  it('should be named windowslive', function() {
    expect(strategy.name).to.equal('windowslive');
  });
  
});
