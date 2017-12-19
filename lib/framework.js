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
  return function passportInitialize(ctx, next) {
    const req = ctx.req;
    req._passport = {
      instance: passport,
    };

    // ref to ctx
    req.ctx = ctx;
    req.session = ctx.session;
    req.query = ctx.query;
    req.body = ctx.request.body;

    if (req.session && req.session[passport._key]) {
      // load data from existing session
      req._passport.session = req.session[passport._key];
    }

    return next();
  };
}

// refactor passport session with koa middleware for performance
// https://github.com/jaredhanson/passport/blob/master/lib/strategies/session.js
function session() {
  return async function passportSession(ctx, next) {
    const req = ctx.req;
    let sessionUser;
    if (req._passport.session) {
      sessionUser = req._passport.session.user;
    }

    if (sessionUser || sessionUser === 0) {
      const user = await ctx.app.passport.deserializeUser(ctx, sessionUser);
      if (!user) {
        req._passport.session.user = undefined;
      } else {
        req[ctx.app.passport._userProperty] = user;
      }
    }

    return next();
  };
}

function authenticate(passport, name, options) {
  // Don't support authenticate with callback

  // function authenticate(req, res, next)
  const connectMiddleware = connectFramework.authenticate(passport, name, options);

  debug('use authenticate:%s, options: %j', name, options);
  return async function passportAuthenticate(ctx, next) {
    const req = ctx.req;
    const res = new MockResponse(ctx);
    debug('do authenticate:%s -> %s %s %j', name, ctx.method, ctx.url, ctx.header);

    // A simple way to use connectMiddleware
    let resEnd = false;
    await new Promise((resolve, reject) => {
      res.once('end', () => {
        debug('response end on authenticate:%s -> %s %s', name, ctx.method, ctx.url);
        resEnd = true;
        resolve();
      });
      connectMiddleware(req, res, err => {
        if (err) return reject(err);
        resolve();
      });
    });

    // response end
    if (resEnd) return;

    return next();
  };
}
