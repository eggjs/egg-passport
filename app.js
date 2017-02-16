'use strict';

const KoaPassport = require('./lib/passport');

module.exports = app => {
  app.passport = new KoaPassport();

  app.config.coreMiddleware.push('passportInitialize');
  app.config.coreMiddleware.push('passportSession');
};
