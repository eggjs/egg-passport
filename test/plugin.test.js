'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');

describe('test/plugin.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'plugin-test',
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('should show login tips when user unauthenticated', () => {
    return request(app.callback())
      .get('/')
      .expect(/Login with/)
      .expect(200);
  });

  it('should show authenticated user info', () => {
    app.mockUser();
    return request(app.callback())
      .get('/')
      .expect(/Authenticated user:/)
      .expect(/mock displayName \/ 10086/)
      .expect(200);
  });

  it('should get mock authenticated user context', function* () {
    const ctx = app.mockUserContext();
    assert(ctx.user);
    assert(ctx.user.id === '10086');
    assert(ctx.user.provider = 'mock');
    assert(ctx.isAuthenticated() === true);

    const user = yield ctx.service.user.find();
    assert(user);
  });

  it('should redirect to weibo oauth url', () => {
    return request(app.callback())
      .get('/passport/weibo')
      .expect(/Found/)
      .expect('Location', /https:\/\/api.weibo.com\/oauth2\/authorize\?response_type=code&redirect_uri=/)
      .expect(302);
  });

  it('should GET callback also redirect to weibo oauth url', () => {
    return request(app.callback())
      .get('/passport/weibo/callback')
      .expect(/Found/)
      .expect('Location', /https:\/\/api.weibo.com\/oauth2\/authorize\?response_type=code&redirect_uri=/)
      .expect(302);
  });

  it('should 401 when apikey missing', () => {
    return request(app.callback())
      .get('/passport/localapikey')
      .expect(/<title>AuthenticationError Error<\/title>/)
      .expect(/Unauthorized/)
      .expect(401);
  });

  it('should return 401 json format when apikey missing', () => {
    return request(app.callback())
      .get('/passport/localapikey')
      .set('Accept', 'application/json')
      .expect({
        message: 'Unauthorized',
      })
      .expect(401);
  });

  it('should auth success and redirect', function* () {
    let cookie;
    yield request(app.callback())
      .get('/passport/localapikey?apikey=eggapp')
      .expect('Location', '/')
      .expect(res => {
        cookie = res.headers['set-cookie'].join(';');
      })
      .expect(302);

    assert(cookie);
    yield request(app.callback())
      .get('/')
      .set('Cookie', cookie)
      .expect(/Authenticated user/)
      .expect(/my name is egg \/ eggapp/)
      .expect(200);
  });
});
