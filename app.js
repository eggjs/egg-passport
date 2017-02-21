'use strict';

const assert = require('assert');
const Passport = require('./lib/passport');

module.exports = app => {
  app.passport = new Passport(app);

  assert(app.config.coreMiddleware.includes('session'), '[egg-passport] session middleware must exists');
  app.config.coreMiddleware.push('passportInitialize');
  app.config.coreMiddleware.push('passportSession');
};
