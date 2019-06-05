'use strict';

const path = require('path');

exports.passportWeibo = {
  enable: true,
  package: 'egg-passport-weibo',
};

exports.passportTwitter = {
  enable: true,
  package: 'egg-passport-twitter',
};

exports.passportGithub = {
  enable: true,
  package: 'egg-passport-github',
};

exports.passportLocalapikey = {
  enable: true,
  path: path.join(__dirname, '../app/plugin/passport-localapikey'),
};
