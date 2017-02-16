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

### Using github and twitter strategy

```js
// app.js

const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = app => {
  const githubStrategy = new GithubStrategy({
    consumerKey: app.config.github.consumerKey,
    consumerSecret: app.config.github.consumerSecret,
    // authURL: '/passport/auth/github',
    // callbackURL: '/passport/auth/github/callback',
    // scope: [ 'user:email' ],
  }, function* (accessToken, refreshToken, profile, done) {
    const user = yield User.findOrCreate(...);
    // user must contains `id` property
    return user;
  });

  const twitterStrategy = new TwitterStrategy({
    consumerKey: app.config.twitter.consumerKey,
    consumerSecret: app.config.twitter.consumerSecret,
    // authURL: '/passport/auth/twitter',
    // callbackURL: '/passport/auth/twitter/callback',
  }, function* (token, tokenSecret, profile, done) {
    const user = yield User.findOrCreate(...);
    // user must contains `id` property
    return user;
  });

  app.passport.use(githubStrategy);
  app.passport.use(twitterStrategy);
};
```

### Authenticate Requests

Use `app.passport.authenticate()`, specifying the `'github'` and `'twitter'` strategy, to authenticate requests.

```js
// app/router.js

module.exports = app => {
  app.get('/passport/auth/github', app.passport.authenticate('github'));
  app.get('/passport/auth/twitter', app.passport.authenticate('twitter'));
};
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
