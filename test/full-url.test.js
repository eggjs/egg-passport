'use strict';

const mm = require('egg-mock');

describe('test/full-url.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'full-url-test',
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('should redirect to github oauth url', () => {
    return app.httpRequest()
      .get('/passport/github')
      .expect(/Found/)
      .expect('Location', /https:\/\/github.com\/login\/oauth\/authorize\?response_type=code&redirect_uri=https/)
      .expect(302);
  });

  it('should GET callback also redirect to github oauth url', () => {
    return app.httpRequest()
      .get('/passport/github/callback')
      .expect(/Found/)
      .expect('Location', /https:\/\/github.com\/login\/oauth\/authorize\?response_type=code&redirect_uri=https/)
      .expect(302);
  });
});
