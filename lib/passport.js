'use strict';

const debug = require('debug')('egg-passport:passport');
const Passport = require('passport').Passport;
const SessionStrategy = require('passport').strategies.SessionStrategy;
const framework = require('./framework');
const url = require('url');

class EggPassport extends Passport {
  constructor(app) {
    super();

    this.app = app;
    this._verifyHooks = [];
    this._serializeUserHooks = [];
    this._deserializeUserHooks = [];
  }

  /**
   * Overide the initialize authenticator to make sure `__monkeypatchNode` run once.
   */
  init() {
    this.framework(framework);
    this.use(new SessionStrategy());
  }

  /**
   * Middleware that will authorize a third-party account using the given
   * `strategy` name, with optional `options`.
   *
   * Examples:
   *
   *    passport.authorize('twitter', { failureRedirect: '/account' });
   *
   * @param {String} strategy - strategy provider name
   * @param {Object} [options] - optional params
   * @return {Function} middleware
   * @api public
   */
  authenticate(strategy, options = {}) {
    // try to use successReturnToOrRedirect first
    if (!options.hasOwnProperty('successRedirect') && !options.hasOwnProperty('successReturnToOrRedirect')) {
      // app use set `ctx.session.returnTo = ctx.path` before auth redirect
      options.successReturnToOrRedirect = '/';
    }
    if (!options.hasOwnProperty('failWithError')) {
      options.failWithError = true;
    }
    return super.authenticate(strategy, options);
  }

  session() {
    return this._framework.session();
  }

  mount(strategy, options = {}) {
    options.loginURL = options.loginURL || `/passport/${strategy}`;
    options.callbackURL = options.callbackURL || `/passport/${strategy}/callback`;
    const auth = this.authenticate(strategy, options);
    this.app.get(url.parse(options.loginURL).pathname, auth);
    this.app.get(url.parse(options.callbackURL).pathname, auth);
  }

  doVerify(req, user, done) {
    const hooks = this._verifyHooks;
    if (hooks.length === 0) return done(null, user);
    (async () => {
      const ctx = req.ctx;
      for (const handler of hooks) {
        user = await handler(ctx, user);
        if (!user) {
          break;
        }
      }
      done(null, user);
    })().catch(done);
  }

  /**
   * Verify authenticated user
   *
   * @param {Function} handler - verify handler
   */
  verify(handler) {
    this._verifyHooks.push(this.app.toAsyncFunction(handler));
  }

  serializeUser(handler) {
    if (typeof handler === 'function') {
      // serializeUser(async function (ctx, user))
      this._serializeUserHooks.push(this.app.toAsyncFunction(handler));
    } else if (arguments.length === 3) {
      // passport => http/request.js call passport.serializeUser(verifiedUser, req, done)
      const verifiedUser = arguments[0];
      const req = arguments[1];
      const done = arguments[2];
      return this._handleSerializeUser(req.ctx, verifiedUser, done);
    } else {
      debug(arguments);
      throw new Error('Unkown serializeUser called');
    }
  }

  deserializeUser(handler) {
    if (typeof handler === 'function') {
      // deserializeUser(async function (ctx, user))
      this._deserializeUserHooks.push(this.app.toAsyncFunction(handler));
    } else {
      // return promise
      const ctx = arguments[0];
      const sessionUser = arguments[1];
      return this._handleDeserializeUser(ctx, sessionUser);
    }
  }

  _handleSerializeUser(ctx, verifiedUser, done) {
    const hooks = this._serializeUserHooks;
    debug('serializeUserHooks length: %d', hooks.length);
    // make sure profile proerty cleanup
    if (verifiedUser && verifiedUser.profile) {
      verifiedUser.profile = undefined;
    }

    if (hooks.length === 0) return done(null, verifiedUser);

    (async () => {
      let sessionUser = verifiedUser;
      for (const handler of hooks) {
        sessionUser = await handler(ctx, sessionUser);
        if (!sessionUser) {
          break;
        }
      }
      debug('serializeUser %j => %j', verifiedUser, sessionUser);
      done(null, sessionUser);
    })().catch(done);
  }

  async _handleDeserializeUser(ctx, sessionUser) {
    const hooks = this._deserializeUserHooks;
    debug('deserializeUserHooks length: %d', hooks.length);
    if (hooks.length === 0) return sessionUser;

    let user = sessionUser;
    for (const handler of hooks) {
      user = await handler(ctx, user);
      if (!user) {
        break;
      }
    }
    debug('deserializeUser %j => %j', sessionUser, user);
    return user;
  }
}

module.exports = EggPassport;
