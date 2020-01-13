import { Context, Request } from 'egg';

import { AuthenticateOptions, Strategy, Authenticator } from 'passport';

interface IMountOptions extends AuthenticateOptions {
  loginURL?: string;
  callbackURL?: string;
}

interface EggPassport extends Authenticator {
  authenticate<AuthenticateRet = any>(strategy: string | string[]): AuthenticateRet;
  authenticate<AuthenticateRet = any>(strategy: string | string[], options: AuthenticateOptions): AuthenticateRet;

  session<AuthenticateRet = any>(): AuthenticateRet;

  mount(strategy: string, options?: IMountOptions): void;

  doVerify<TUserPayload = any, TUser = any>(req: Request, user: TUserPayload, done: (err: any, user?: TUser) => void): void;

  verify<TUser = any, TID = any>(fn: (ctx: Context, id: TID) => Promise<TUser>): void;

  serializeUser<TUser = any, TID = any>(fn: (ctx: Context, user: TUser) => TID): void;
  serializeUser<TID = any>(id: TID, req: Request, done: (err: any, id?: TID) => void): void;

  deserializeUser<TUser = any, TID = any>(fn: (ctx: Context, id: TID) => void): void;
  deserializeUser<TUser = any, TID = any>(fn: (ctx: Context, id: TID) => Promise<TUser>): void;
  deserializeUser<TUser = any, TID = any>(ctx: Request, id: TID): void;
  deserializeUser<TUser = any, TID = any>(ctx: Request, id: TID): Promise<TUser>;
}

declare module 'egg' {
  // extend app
  interface Application {
    passport: EggPassport;
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

  // extend config
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
