import { Controller } from 'egg';

export default class UserController extends Controller {
  logout() {
    this.ctx.logout();
    this.ctx.redirect(this.ctx.get('referer') || '/');
  }
}
