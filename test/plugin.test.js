'use strict';

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

  it('should GET /', () => {
    return request(app.callback())
      .get('/')
      .expect(200);
  });
});
