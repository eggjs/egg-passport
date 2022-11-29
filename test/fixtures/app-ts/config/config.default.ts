import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  config.keys = 'foo';

  config.session = {
    key: 'foo',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true
  }

  config.passportLocal = {
    usernameField: 'username',
    passwordField: 'password'
  }

  config.serverTimeout = 2 * 60 * 1000;

  config.passportWeibo = {
    key: process.env.EGG_PASSPORT_WEIBO_CLIENT_ID as string,
    secret: process.env.EGG_PASSPORT_WEIBO_CLIENT_SECRET as string,
  };

  config.passportTwitter = {
    key: process.env.EGG_PASSPORT_TWITTER_CONSUMER_KEY as string,
    secret: process.env.EGG_PASSPORT_TWITTER_CONSUMER_SECRET as string,
  },

  config.passportGithub = {
    key: 'wrong-client-id',
    secret: 'wrong-client-secret',
  };

  return config
}
