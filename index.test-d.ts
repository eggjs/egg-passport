import { expectType } from 'tsd';
import * as egg from '.';

const app = {} as egg.Application;
const ctx = {} as egg.Context;

expectType<boolean>(ctx.isAuthenticated());

// expectType<any>(app.passport.mount('foo'));
expectType<string>(app.config.passportLocal?.passwordField!);
