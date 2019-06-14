'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/user', 'home.index');

  app.passport.mount('github', {
    callbackURL: 'https://example.com/passport/github/callback',
  });
};
