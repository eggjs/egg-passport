import { Application } from 'egg';
import { Strategy } from 'passport-localapikey';

interface UserIdentity {
  provider: string;
  apikey: string;
  name: string;
  displayName: string;
  photo: string;
  profile: object;
  currentUrl: string;
  lastUrl: string;
}

export default (app: Application) => {
  app.passport.verify(async (_ctx, user: UserIdentity) => {
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

  app.passport.serializeUser(async (ctx, user: UserIdentity) => {
    user.currentUrl = ctx.url;
    return user;
  });

  app.passport.deserializeUser(async (ctx, user: UserIdentity) => {
    user.lastUrl = user.currentUrl;
    user.currentUrl = ctx.url;
    return user;
  });

  // register localapikey strategy into `app.passport`
  // must require `req` params
  app.passport.use('localapikey', new Strategy({ passReqToCallback: true }, (req, apikey, done) => {
    // format user
    const user = {
      provider: 'localapikey',
      id: apikey,
      apikey,
    };
    // let passport do verify and call verify hook
    app.passport.doVerify(req, user, done);
  }));
}
