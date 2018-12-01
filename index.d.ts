import {
    Application,
    Context,
    Request,
} from 'egg';
import {
    Middleware,
} from "koa";
import * as passport from "passport";

declare module 'egg' {
    interface Application {
        passport: EggPassport.passport;
    }

    interface EggApplication {
        passport: EggPassport.passport;
    }

    interface User {
        id: number | string;
        provider: string;
    }

    interface Context {
        user: any;
        login(user: any, options?: any): Promise<void>;
        logIn: Context["login"];

        logout(): void;
        logOut: Context["logout"];

        isAuthenticated(): boolean;
        isUnauthenticated(): boolean;
    }
}

declare namespace EggPassport {
    class passport {
        init(): void;

        use(strategy: passport.Strategy): this;
        use(name: string, strategy: passport.Strategy): this;
        unuse(name: string): this;

        framework(fw: passport.Framework): this;

        session(): Middleware;

        authenticate(strategy: string | string[], options: passport.AuthenticateOptions | object): Middleware;

        serializeUser: passport.Authenticator["serializeUser"];
        deserializeUser: passport.Authenticator["deserializeUser"];

        doVerify(req: Request, user: {}, done: any): void;
        verify(handler: (ctx: Context, user: {}) => {} | undefined): void;
    }
}

declare const eggPassport: EggPassport.passport;

export = eggPassport;
