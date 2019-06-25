import { Application } from 'egg';

export default (app: Application) => {
  app.get('/', 'home.index');
  app.get('/user', 'home.index');

  const weiboAuth = app.passport.authenticate('weibo');
  app.get('/passport/weibo', weiboAuth);
  app.get('/passport/weibo/callback', weiboAuth);

  const twitterAuth = app.passport.authenticate('twitter');
  app.get('/passport/twitter', twitterAuth);
  app.get('/passport/twitter/callback', twitterAuth);

  const githubAuth = app.passport.authenticate('github', {
    successReturnToOrRedirect: '/',
  });
  app.get('/passport/github', githubAuth);
  app.get('/passport/github/callback', githubAuth);
  // app.get('/passport/github/callback2', app.passport.authenticate('github', function* (err, user, info, status) {
  //   console.log(err, user, info, status);
  // }));

  app.get('/passport/localapikey', app.passport.authenticate('localapikey'));

  app.get('/logout', 'user.logout');
}
