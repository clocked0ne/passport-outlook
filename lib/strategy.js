/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , OutlookAPIError = require('./errors/outlookapierror');


/**
 * `Strategy` constructor.
 *
 * The Outlook authentication strategy authenticates requests by delegating
 * to Outlook REST API using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Outlook application's client ID
 *   - `clientSecret`  your Outlook application's client secret
 *   - `callbackURL`   URL to which Outlook will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new OutlookStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/outlook/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  options.tokenURL = options.tokenURL || 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'outlook';
  this._userProfileURL = options.userProfileURL || 'https://apis.live.net/v5.0/me';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Outlook.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `outlook`
 *   - `id`               the user's Outlook ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
        
      if (json && json.error) {
        return done(new OutlookAPIError(json.error.message, json.error.code));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider  = 'outlook';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
