'use strict';

module.exports = app => {
  return class UserService extends app.Service {
    * find() {
      return this.ctx.user;
    }
  };
};
