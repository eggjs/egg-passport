# egg-passport

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-passport.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-passport
[travis-image]: https://img.shields.io/travis/eggjs/egg-passport.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-passport
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-passport.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-passport?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-passport.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-passport
[snyk-image]: https://snyk.io/test/npm/egg-passport/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-passport
[download-image]: https://img.shields.io/npm/dm/egg-passport.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-passport

passport plugin for egg, base on [passportjs](http://passportjs.org).

## Install

```bash
$ npm i egg-passport
```

## Usage

### enable passport plugin

```js
// config/plugin.js
exports.passport = {
  enable: true,
  package: 'egg-passport',
};
```

### Using Github and Twitter strategy

```js
// config/config.default.js
exports.passportGithub = {
  key: 'my oauth2 clientID',
  secret: 'my oauth2 clientSecret',
};

exports.passportTwitter = {
  key: 'my oauth1 consumerKey',
  secret: 'my oauth1 consumerSecret',
};
```

### Authenticate Requests

Use `app.passport.mount(strategy[, options])`, specifying the `'github'` and `'twitter'` strategy, to authenticate requests.

```js
// app/router.js
module.exports = app => {
  app.get('/', 'home.index');

  // authenticates routers
  app.passport.mount('github');
  // this is a passport router helper, it's equal to the below codes
  //
  // const github = app.passport.authenticate('github');
  // app.get('/passport/github', github);
  // app.get('/passport/github/callback', github);

  // custom options.login url and options.successRedirect
  app.passport.mount('twitter', {
    loginURL: '/account/twitter',
    // auth success redirect to /
    successRedirect: '/',
  });
};
```

### Verify and store user

Use `app.passport.verify(async (ctx, user) => {})` hook:

```js
// app.js
module.exports = app => {
  app.passport.verify(async (ctx, user) => {
    // check user
    assert(user.provider, 'user.provider should exists');
    assert(user.id, 'user.id should exists');

    // find user from database
    //
    // Authorization Table
    // column   | desc
    // ---      | --
    // provider | provider name, like github, twitter, facebook, weibo and so on
    // uid      | provider unique id
    // user_id  | current application user id
    const auth = await ctx.model.Authorization.findOne({
      uid: user.id,
      provider: user.provider,
    });
    const existsUser = await ctx.model.User.findOne({ id: auth.user_id });
    if (existsUser) {
      return existsUser;
    }
    // call user service to register a new user
    const newUser = await ctx.service.user.register(user);
    return newUser;
  });
};
```

## How to develop an `egg-passport-${provider}` plugin

See example: [egg-passport-twitter](https://github.com/eggjs/egg-passport-twitter).

- Plugin dependencies on [egg-passport](https://github.com/eggjs/egg-passport) to use `app.passport` APIs.

```json
// package.json
{
  "eggPlugin": {
    "name": "passportTwitter",
    "dependencies": [
      "passport"
    ]
  },
}
```

- Define config and set default values

**Must use `key` and `secret` instead of `consumerKey|clientID` and `consumerSecret|clientSecret`.**

```js
// config/config.default.js
exports.passportTwitter: {
  key: '',
  secret: '',
  callbackURL: '/passport/twitter/callback',
};
```

- Init `Strategy` in `app.js` and format user in `verify callback`

```js
// app.js
const debug = require('debug')('egg-passport-twitter');
const assert = require('assert');
const Strategy = require('passport-twitter').Strategy;

module.exports = app => {
  const config = app.config.passportTwitter;
  // must set passReqToCallback to true
  config.passReqToCallback = true;
  assert(config.key, '[egg-passport-twitter] config.passportTwitter.key required');
  assert(config.secret, '[egg-passport-twitter] config.passportTwitter.secret required');
  // convert to consumerKey and consumerSecret
  config.consumerKey = config.key;
  config.consumerSecret = config.secret;

  // register twitter strategy into `app.passport`
  // must require `req` params
  app.passport.use('twitter', new Strategy(config, (req, token, tokenSecret, params, profile, done) => {
    // format user
    const user = {
      provider: 'twitter',
      id: profile.id,
      name: profile.username,
      displayName: profile.displayName,
      photo: profile.photos && profile.photos[0] && profile.photos[0].value,
      token,
      tokenSecret,
      params,
      profile,
    };
    debug('%s %s get user: %j', req.method, req.url, user);
    // let passport do verify and call verify hook
    app.passport.doVerify(req, user, done);
  }));
};
```

- That's all!

## APIs

### extent `application`

- `app.passport.mount(strategy, options)`: Mount the login and the login callback routers to use the given `strategy`.
- `app.passport.authenticate(strategy, options)`: Create a middleware that will authorize a third-party account using the given `strategy` name, with optional `options`.
- `app.passport.verify(handler)`: Verify authenticated user
- `app.passport.serializeUser(handler)`: Serialize user before store into session
- `app.passport.deserializeUser(handler)`: Deserialize user after restore from session

### extend `context`

- `ctx.user`: get the current authenticated user
- `ctx.isAuthenticated()`: Test if request is authenticated
- `* ctx.login(user[, options])`: Initiate a login session for `user`.
- `ctx.logout()`: Terminate an existing login session

## Unit Tests

This plugin has includes some mock methods to helper you writing unit tests more conveniently.

### `app.mockUser([user])`: Mock an authenticated user

```js
const mm = require('egg-mock');

describe('mock user demo', () => {
  let app;
  before(() => {
    app = mm.app();
    return app.ready();
  });
  after(() => app.close());

  afterEach(mm.restore);

  it('should show authenticated user info', () => {
    app.mockUser();
    return request(app.callback())
      .get('/')
      .expect(/user name: mock_name/)
      .expect(200);
  });
});
```

### `app.mockUserContext([user])`: Mock a context instance with authenticated user

```js
it('should get authenticated user and call service', async () => {
  const ctx = app.mockUserContext();
  const result = await ctx.service.findUser({ id: ctx.user.id });
  assert(result.user.id === ctx.user.id);
});
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
