'use strict';

const debug = require('debug')('egg-passport:passport');
const co = require('co');
const Passport = require('passport').Passport;
const SessionStrategy = require('passport').strategies.SessionStrategy;
const framework = require('./framework');

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
    this.app.get(options.loginURL, auth);
    this.app.get(options.callbackURL, auth);
  }

  doVerify(req, user, done) {
    const hooks = this._verifyHooks;
    if (hooks.length === 0) return done(null, user);

    co(function* () {
      const ctx = req.ctx;
      for (const handler of hooks) {
        user = yield handler(ctx, user);
        if (!user) {
          break;
        }
      }
      done(null, user);
    })
    .catch(done);
  }

  /**
   * Verify authenticated user
   *
   * @param {Function} handler - verify handler
   */
  verify(handler) {
    this._verifyHooks.push(handler);
  }

  serializeUser(handler) {
    if (typeof handler === 'function') {
      // serializeUser(function* (ctx, user))
      this._serializeUserHooks.push(handler);
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

  * deserializeUser(handler) {
    if (typeof handler === 'function') {
      // deserializeUser(function* (ctx, user))
      this._deserializeUserHooks.push(handler);
    } else {
      // yield passport.deserializeUser(ctx, sessionUser)
      const ctx = arguments[0];
      const sessionUser = arguments[1];
      return yield this._handleDeserializeUser(ctx, sessionUser);
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

    co(function* () {
      let sessionUser = verifiedUser;
      for (const handler of hooks) {
        sessionUser = yield handler(ctx, sessionUser);
        if (!sessionUser) {
          break;
        }
      }
      debug('serializeUser %j => %j', verifiedUser, sessionUser);
      done(null, sessionUser);
    })
    .catch(done);
  }

  * _handleDeserializeUser(ctx, sessionUser) {
    const hooks = this._deserializeUserHooks;
    debug('deserializeUserHooks length: %d', hooks.length);
    if (hooks.length === 0) return sessionUser;

    let user = sessionUser;
    for (const handler of hooks) {
      user = yield handler(ctx, user);
      if (!user) {
        break;
      }
    }
    debug('serializeUser %j => %j', sessionUser, user);
    return user;
  }
}

module.exports = EggPassport;
