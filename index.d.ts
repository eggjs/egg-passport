import 'egg';

import * as passport from 'passport';

interface IMountOptions {
  loginURL: string;
  callbackURL: string;
}

interface IVerifyUser {
  username: string;
  password: string;
}

declare module 'egg' {
  // extend app
  interface Application {
    passport: {
      serializeUser<TUser>(fn: (ctx: Context, user: TUser) => Promise<any>)
      serializeUser<TUser, TID>(fn: (user: TUser, done: (err: any, id?: TID) => void) => void): void;

      deserializeUser<TID>(fn: (ctx: Context, id: TID) => Promise<any>)
      deserializeUser<TUser, TID>(fn: (id: TID, done: (err: any, user?: TUser) => void) => void): void;

      verify(fn: (ctx: Context, user: IVerifyUser) => Promise<any>);

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

  // extend your config
  interface EggAppConfig {
    passportLocal?: {
      usernameField: string;
      passwordField: string;
    },
    passportWeibo?: {
      key: string;
      secret: string;
    },
    passportGithub?: {
      key: string;
      secret: string;
    },
    passportTwitter?: {
      key: string;
      secret: string;
    },
    passportTaobao?: {
      key: string;
      secret: string;
    },
    passportBitbucket?: {
      key: string;
      secret: string;
    }
  }
}
