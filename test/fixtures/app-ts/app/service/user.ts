import { Service } from 'egg';

export default class UserService extends Service {
  async find() {
    return this.ctx.user;
  }
}
