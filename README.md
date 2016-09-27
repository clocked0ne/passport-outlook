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

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'windowslive'` strategy, to
authenticate requests.

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

*Note:* `'offline_access'` is a required scope in order to obtain a
`refresh_token`. More information is available in the [MSDN Dev Center](https://msdn.microsoft.com/en-us/office/office365/api/use-outlook-rest-api#get-an-access-token).

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

  - [Nigel Horton](http://github.com/clocked0ne)
  - [Jared Hanson](http://github.com/jaredhanson)

### Additional Contributors

  - [DJphilomath](http://github.com/DJphilomath)
  - [Andrés González](http://github.com/andreider04)
  - [Dan Perry](http://github.com/dperry)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2016 Nigel Horton
