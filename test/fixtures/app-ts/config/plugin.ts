import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  passport: {
    enable: true,
    package: 'egg-passport',
  },

  passportWeibo: {
    enable: true,
    package: 'egg-passport-weibo',
  },
  
  passportTwitter: {
    enable: true,
    package: 'egg-passport-twitter',
  },
  
  passportGithub: {
    enable: true,
    package: 'egg-passport-github',
  },

}

export default plugin