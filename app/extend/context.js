'use strict';

module.exports = {
  get user() {
    return this.req[this.app.passport._userProperty];
  },

  // https://github.com/jaredhanson/passport/blob/master/lib/http/request.js
  // proxy login, logout, isAuthenticated, isUnauthenticated to ctx.req

  /**
   * Initiate a login session for `user`.
   *
   * @param {Object} user - authenticated user
   * @param {Object} [options] - login options
   *  - {Boolean} options.session - Save login state in session, defaults to true
   * @return {Promise} success or not promise instance
   *
   * @api public
   */
  login(user, options) {
    return new Promise((resolve, reject) => {
      this.req.login(user, options, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  /**
   * Terminate an existing login session.
   *
   * @api public
   */
  logout(...args) {
    this.req.logout(...args);
  },

  /**
   * Test if request is authenticated.
   *
   * @return {Boolean} - if authenticated return true
   * @api public
   */
  isAuthenticated() {
    return this.req.isAuthenticated();
  },
};
