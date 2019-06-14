'use strict';

module.exports = app => {
  app.passport.verify(function* (ctx, user) {
    if (user.provider === 'localapikey') {
      if (user.apikey === 'eggapp') {
        user.name = 'eggapp';
        user.displayName = 'my name is egg';
        user.photo = 'https://zos.alipayobjects.com/rmsportal/JFKAMfmPehWfhBPdCjrw.svg';
        user.profile = {
          _json: user,
        };
      } else {
        return null;
      }
    }

    return user;
  });

  app.passport.serializeUser(function* (ctx, user) {
    user.currentUrl = ctx.url;
    return user;
  });

  app.passport.deserializeUser(function* (ctx, user) {
    user.lastUrl = user.currentUrl;
    user.currentUrl = ctx.url;
    return user;
  });
};
