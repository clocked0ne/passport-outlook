# passport-outlook

[![Build Status](https://travis-ci.org/clocked0ne/passport-outlook.svg)](https://travis-ci.org/clocked0ne/passport-outlook)

## Work in progress

This module is not yet production ready. The Outlook REST API v2 app model is
in preview status and Microsoft are upgrading user accounts in batches in
order to support the v2 API. While this is ongoing and we are working with
specially configured test accounts, this package is still undergoing dev work
and should not be deemed production ready.

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Outlook](http://www.outlook.com/) accounts (aka [Windows Live](http://www.live.com/))
using the OAuth 2.0 API.

This module lets you authenticate using Outlook REST API v2 in your Node.js
applications. By plugging into Passport, Outlook REST API v2 authentication
can be easily and unobtrusively integrated into any application or
framework that supports [Connect](http://www.senchalabs.org/connect/)-style
middleware, including [Express](http://expressjs.com/).

## Install

    $ npm install passport-outlook

## Usage

#### Configure Strategy

The Outlook REST API v2 authentication strategy authenticates users using an
Outlook.com account and OAuth 2.0 tokens.  The strategy requires a `verify`
callback, which accepts these credentials and calls `done` providing a user,
as well as `options` specifying a client ID, client secret, and callback URL.

    passport.use(new OutlookStrategy({
        clientID: OUTLOOK_CLIENT_ID,
        clientSecret: OUTLOOK_CLIENT_SECRET,
        callbackURL: "http://www.example.com/auth/outlook/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ outlookId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'outlook'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/outlook',
      passport.authenticate('outlook', {
        scope: [
          'openid',
          'https://outlook.office.com/mail.read'
        ]
      })
    );

    app.get('/auth/outlook/callback', 
      passport.authenticate('outlook', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/clocked0ne/passport-outlook/tree/master/examples/login).

## Tests

    $ npm install
    $ npm test

## Credits

  - [Nigel Horton](http://github.com/clocked0ne)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2016 Nigel Horton
