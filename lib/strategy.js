/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , OutlookAPIError = require('./errors/outlookapierror')
  , request = require('request');


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
 *   - `clientID`      your Windows Live application's client ID
 *   - `clientSecret`  your Windows Live application's client secret
 *   - `callbackURL`   URL to which Windows Live will redirect the user after granting authorization
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
function Strategy (options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  options.tokenURL = options.tokenURL || 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = options.name || 'windowslive';
  this._userProfileURL = options.userProfileURL || 'https://outlook.office.com/api/v2.0/me';

  /**
   * Overwrite `_oauth2.get` to use `request.get` allowing for custom headers.
   */
  this._oauth2.get = function (url, accessToken, callback) {
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': 'application/json; odata.metadata=none'
      }
    }, callback);
  };

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Return extra parameters to be included in the authorization request.
 *
 * Options:
 *  - `locale`    The display type to be used for the authorization page. 
 *                Valid values are "popup", "touch", "page", or "none".
 *  - `display`   Optional. A market string that determines how the consent UI 
 *                is localized. If the value of this parameter is missing or is
 *                not valid, a market value is determined by using an internal 
 *                algorithm.
 *                
 * @param {object} options
 * @return {object}
 * @access protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};

  ['locale', 'display'].forEach(function (name) {
    if (options[name]) {
      params[name] = options[name]
    }
  });

  return params;
};

/**
 * Retrieve user profile from Outlook.com / Office 365.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `windowslive`
 *   - `id`               the user's Outlook ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, res, body) {
    /* Specific case where a user creates a new Outlook account via the OAuth screen
     * and the redirect back to the application bypasses M$'s account finalisation
     * process, giving you an Outlook account with no Mailbox entry.
     */
    if (res && res.statusCode === 404) {
        return done(new OutlookAPIError(res.headers['x-caserrorcode'], res.statusCode));
    }

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
    profile.provider = 'windowslive';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
