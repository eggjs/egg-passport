'use strict';

module.exports = {
  /**
   * mock an authenticated user
   *
   * @param {Object} [user] - mock user data
   */
  mockUser(user) {
    user = Object.assign({
      provider: 'mock',
      id: '10086',
      name: 'mock_name',
      displayName: 'mock displayName',
      photo: 'https://tva2.sinaimg.cn/crop.0.0.180.180.180/61c56ebcjw1e8qgp5bmzyj2050050aa8.jpg',
      profile: {
        photos: [
          { value: 'http://tva2.sinaimg.cn/crop.0.0.180.180.180/61c56ebcjw1e8qgp5bmzyj2050050aa8.jpg' },
        ],
        _raw: '{}',
        _json: {
          id: '10086',
          screen_name: 'mock_name',
          displayName: 'mock displayName',
        },
      },
    }, user);

    const createContext = this.createContext;
    this.mm(this, 'createContext', (req, res) => {
      req.user = user;
      const ctx = createContext.call(this, req, res);
      return ctx;
    });
  },

  /**
   * mock a context instance with authenticated user
   *
   * @param {Object} [user] - mock user data
   * @return {Context} ctx - context instance
   */
  mockUserContext(user) {
    this.mockUser(user);
    const ctx = this.mockContext();
    // ctx.req is not the http request
    // login, logout, isAuthenticated, isUnauthenticated
    ctx.req.login = () => Promise.resolve();
    ctx.req.logout = () => {};
    ctx.req.isAuthenticated = () => true;
    ctx.req.isUnauthenticated = () => false;
    return ctx;
  },
};
