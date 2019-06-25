import { Application } from 'egg';

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
  app.passport.verify(async (ctx, user: UserIdentity) => {
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
}
