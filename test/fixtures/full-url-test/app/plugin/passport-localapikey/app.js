'use strict';

const debug = require('debug')('egg-passport-localapikey');
const Strategy = require('passport-localapikey').Strategy;

module.exports = app => {
  const config = app.config.passportLocalapikey;
  // must set passReqToCallback to true
  config.passReqToCallback = true;

  // register localapikey strategy into `app.passport`
  // must require `req` params
  app.passport.use('localapikey', new Strategy(config, (req, apikey, done) => {
    // format user
    const user = {
      provider: 'localapikey',
      id: apikey,
      apikey,
    };
    debug('%s %s get user: %j', req.method, req.url, user);
    // let passport do verify and call verify hook
    app.passport.doVerify(req, user, done);
  }));
};
