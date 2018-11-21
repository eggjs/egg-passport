import { Controller } from 'egg';

// controller
export default class HomeController extends Controller {
  index() {
    if (this.ctx.isAuthenticated()) {
      this.ctx.body = `<div>
        <h2>${this.ctx.path}</h2>
        <hr>
        Authenticated user: <img src="${this.ctx.user.photo}"> ${this.ctx.user.displayName} / ${this.ctx.user.id} | <a href="/logout">Logout</a>
        <pre><code>${JSON.stringify(this.ctx.user, null, 2)}</code></pre>
        <hr>
        <a href="/">Home</a> | <a href="/user">User</a>
      </div>`;
    } else {
      this.ctx.session.returnTo = this.ctx.path;
      this.ctx.body = `
        <div>
          <h2>${this.ctx.path}</h2>
          <hr>
          Login with
          <a href="/passport/weibo">Weibo</a> | <a href="/passport/github">Github</a> |
          <a href="/passport/bitbucket">Bitbucket</a> | <a href="/passport/twitter">Twitter</a>
          <hr>
          <a href="/">Home</a> | <a href="/user">User</a>
        </div>
      `;
    }
  }
}
