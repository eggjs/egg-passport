'use strict';

const debug = require('debug')('egg-passport:framework');
const connectFramework = require('passport/lib/framework/connect')();
const MockResponse = require('./response');

/**
 * Framework support for egg
 * @return {Object} framework
 */
module.exports = {
  initialize,
  session,
  authenticate,
};

function initialize(passport) {
  // https://github.com/jaredhanson/passport/blob/master/lib/middleware/initialize.js
  return function* passportInitialize(next) {
    const req = this.req;
    req._passport = {
      instance: passport,
    };

    // ref to ctx
    req.ctx = this;
    req.session = this.session;
    req.query = this.query;
    req.body = this.request.body;

    if (req.session && req.session[passport._key]) {
      // load data from existing session
      req._passport.session = req.session[passport._key];
    }

    yield next;
  };
}

// refactor passport session with koa middleware for performance
// https://github.com/jaredhanson/passport/blob/master/lib/strategies/session.js
function session() {
  return function* passportSession(next) {
    const req = this.req;
    let sessionUser;
    if (req._passport.session) {
      sessionUser = req._passport.session.user;
    }

    if (sessionUser || sessionUser === 0) {
      const user = yield this.app.passport.deserializeUser(this, sessionUser);
      if (!user) {
        req._passport.session.user = undefined;
      } else {
        req[this.app.passport._userProperty] = user;
      }
    }

    yield next;
  };
}

function authenticate(passport, name, options) {
  // Don't support authenticate with callback

  // function authenticate(req, res, next)
  const connectMiddleware = connectFramework.authenticate(passport, name, options);

  debug('use authenticate:%s, options: %j', name, options);
  return function* passportAuthenticate(next) {
    const req = this.req;
    const res = new MockResponse(this);
    debug('do authenticate:%s -> %s %s %j', name, this.method, this.url, this.header);

    // A simple way to use connectMiddleware
    let resEnd = false;
    const p = new Promise((resolve, reject) => {
      res.once('end', () => {
        debug('response end on authenticate:%s -> %s %s', name, this.method, this.url);
        resEnd = true;
        resolve();
      });
      connectMiddleware(req, res, err => {
        if (err) return reject(err);
        resolve();
      });
    });
    yield p;

    // response end
    if (resEnd) return;

    yield next;
  };
}
