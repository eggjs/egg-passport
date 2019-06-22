import 'egg';

import * as passport from 'passport';

interface IMountOptions {
  loginURL: string;
  callbackURL: string;
}

declare module 'egg' {
  // extend app
  interface Application {
    passport: {
      serializeUser<TUser = any, TID = any>(fn: (ctx: Context, user: TUser) => Promise<TID>)
      serializeUser<TUser = any, TID = any>(fn: (user: TUser, done: (err: any, id?: TID) => void) => void): void;

      deserializeUser<TUser = any, TID = any>(fn: (ctx: Context, id: TID) => Promise<TUser>)
      deserializeUser<TUser = any, TID = any>(fn: (id: TID, done: (err: any, user?: TUser) => void) => void): void;

      verify(fn: (ctx: Context, user: any) => Promise<any>);

      mount(strategy: string, options?: IMountOptions): void;

      authenticate(strategy: string | string[]): any;
      authenticate(strategy: string | string[], options: passport.AuthenticateOptions): any;
    }
  }

  // extend context
  interface Context {
    user?: any;
    login(user: any): Promise<void>;
    login(user: any, options: any): Promise<void>;
    logout(): void;
    isAuthenticated(): boolean;
  }

  interface EggPassportCommonConfig {
    key: string;
    secret: string;
  }

  // extend your config
  interface EggAppConfig {
    passportLocal?: {
      usernameField?: string;
      passwordField?: string;
    },
    passportWeibo?: EggPassportCommonConfig,
    passportGithub?: EggPassportCommonConfig,
    passportTwitter?: EggPassportCommonConfig,
    passportTaobao?: EggPassportCommonConfig,
    passportBitbucket?: EggPassportCommonConfig
  }
}
