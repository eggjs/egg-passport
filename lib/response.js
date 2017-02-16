'use strict';

const debug = require('debug')('egg-passport:response');
const EventEmitter = require('events');

class MockResponse extends EventEmitter {
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  redirect(url) {
    debug('redirect -> %s', url);
    this.ctx.redirect(url);
    this.emit('end');
  }

  setHeader(...args) {
    debug('setHeader -> %j', args);
    this.ctx.set(...args);
  }

  end(content) {
    debug('end -> %j', content);
    if (content) this.ctx.body = content;
    this.emit('end');
  }

  set statusCode(status) {
    debug('statusCode -> %s', status);
    this.ctx.status = status;
  }

  get statusCode() {
    return this.ctx.status;
  }
}

module.exports = MockResponse;
