# passport-outlook

[![Build Status](https://travis-ci.org/clocked0ne/passport-outlook.svg)](https://travis-ci.org/clocked0ne/passport-outlook)

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Outlook](http://www.outlook.com/) accounts (aka [Windows Live](http://www.live.com/))
using the OAuth 2.0 API.

This module lets you authenticate using Outlook REST API v2 in your Node.js
applications. By plugging into Passport, Outlook REST API v2 authentication
can be easily and unobtrusively integrated into any application or
framework that supports [Connect](http://www.senchalabs.org/connect/)-style
middleware, including [Express](http://expressjs.com/).

Unlike alternative modules, this package authenticates against the latest
Outlook.com (Office 365) v2 endpoints as can be tested in their
[Outlook Dev Center OAuth Sandbox](https://oauthplay.azurewebsites.net/)

## Install

```bash
$ npm install --save passport-outlook
```

## Usage

#### v3

There are no behavioural changes but as of v3 the minimum required NodeJS version
is v10. This should not affect most users but is a breaking change nonetheless.

#### Upgrading for v2

If you were using the package before `v2.0.0`, please note that the `profile`
JSON returned has been updated to match the normalized contact schema outlined
by [Passport](http://passportjs.org/docs/profile) and used by other strategies.

Therefore, you will need to update your application to match these modified JSON
properties.

#### Create an Application

Before using `passport-outlook`, you must register an application with Microsoft.
If you have not already done so, a new application can be created at the
[Application Registration Portal](https://apps.dev.microsoft.com/). Your
application will be issued a client ID and client secret, which need to be
provided to the strategy. You will also need to configure a redirect URL which
matches the route in your application.


#### Configure Strategy

The Outlook REST API v2 authentication strategy authenticates users using an
Outlook.com account and OAuth 2.0 tokens.  The strategy requires a `verify`
callback, which accepts these credentials and calls `done` providing a user,
as well as `options` specifying a client ID, client secret, and callback URL.

```js
passport.use(new OutlookStrategy({
    clientID: OUTLOOK_CLIENT_ID,
    clientSecret: OUTLOOK_CLIENT_SECRET,
    callbackURL: 'http://www.example.com/auth/outlook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    var user = {
      outlookId: profile.id,
      name: profile.DisplayName,
      email: profile.EmailAddress,
      accessToken:  accessToken
    };
    if (refreshToken)
      user.refreshToken = refreshToken;
    if (profile.MailboxGuid)
      user.mailboxGuid = profile.MailboxGuid;
    if (profile.Alias)
      user.alias = profile.Alias;
    User.findOrCreate(user, function (err, user) {
      return done(err, user);
    });
  }
));
```

Additional options are supported as part of the described 
[implicit grant flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-implicit-grant-flow):
`prompt`, `login_hint` & `domain_hint`.

*Note:*
If you want to use the express request, you must use the option
`passReqToCallback: true`, then Passport will send the request as the first parameter.

```js
passport.use(new OutlookStrategy({
    clientID: OUTLOOK_CLIENT_ID,
    clientSecret: OUTLOOK_CLIENT_SECRET,
    callbackURL: 'http://www.example.com/auth/outlook/callback',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    var user = {
      outlookId: profile.id,
      name: profile.DisplayName,
      email: profile.EmailAddress,
      accessToken:  accessToken
    };
    if (refreshToken)
      user.refreshToken = refreshToken;
    if (profile.MailboxGuid)
      user.mailboxGuid = profile.MailboxGuid;
    if (profile.Alias)
      user.alias = profile.Alias;
    User.findOrCreate(user, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'windowslive'` (or custom named)
strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/outlook',
  passport.authenticate('windowslive', {
    scope: [
      'openid',
      'profile',
      'offline_access',
      'https://outlook.office.com/Mail.Read'
    ]
  })
);

app.get('/auth/outlook/callback', 
  passport.authenticate('windowslive', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

*Note:*
REST API specific scopes you are using must be fully qualified to match the
outlook domain, e.g: `https://outlook.office.com/Mail.Read` instead of `Mail.Read`
This is very important, otherwise you will receive `401` responses.

`'offline_access'` is a required scope in order to obtain a
`refresh_token`. More information is available in the [MSDN Dev Center](https://msdn.microsoft.com/en-us/office/office365/api/use-outlook-rest-api#get-an-access-token).

#### Customising endpoints

If you need to customise the URLs used by the strategy (such as
connecting to the [Microsoft Graph](https://developer.microsoft.com/en-us/graph)
API instead of Office365 REST) this is possible by modifying the
`options` passed to the strategy:

```js
passport.use(new OutlookStrategy({
    clientID: OUTLOOK_CLIENT_ID,
    clientSecret: OUTLOOK_CLIENT_SECRET,
    callbackURL: 'http://www.example.com/auth/graph/callback',
    userProfileURL: 'https://graph.microsoft.com/v1.0/me?$select=userPrincipalName',
    name: 'msgraph'
  },
  function(accessToken, refreshToken, profile, done) {
     // Callback logic as per examples
  }
));
```

In the example above the strategy `name` is changeed from the default of `'windowslive'`
to `'msgraph'` and the `userProfileURL` is changed to the correct Microsoft Graph
API endpoint. If you make this change, please remember to use the appropriate scopes
for the API.

## Examples

For a complete, working example, refer to the [login example](https://github.com/clocked0ne/passport-outlook/tree/master/examples/login).

## Tests

Any system can run the test suite in development from the terminal.

```bash
$ npm install
$ npm test
```

## Contributing

#### Tests

The test suite is located in the `test/` directory. All new features are
expected to have corresponding test cases. Ensure that the complete test suite
passes by executing:

```bash
$ make test
```

#### Coverage

All new features are expected to have test coverage. Patches that
increase test coverage are happily accepted. Coverage reports can be viewed by
executing:

```bash
$ make test-cov
$ make view-cov
```

## Credits

  - [Nigel Horton](https://github.com/clocked0ne)
  - [Jared Hanson](https://github.com/jaredhanson)

### Additional Contributors

  - [Thomas Potaire](https://github.com/http-teapot)
  - [DJphilomath](https://github.com/DJphilomath)
  - [Andrés González](https://github.com/andreider04)
  - [Dan Perry](https://github.com/dperry)
  - [Jesé Romero Arbelo](https://github.com/Linkaynn)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2019 Nigel Horton
