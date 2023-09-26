module.exports = (on, config) => {
  if (config.env.inProcessmaker) {
    config.baseUrl = 'https://processmaker.local.processmaker.com';
  }
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push('--disable-gpu');
      return launchOptions;
    }
  });

  require('@cypress/code-coverage/task')(on, config);

  return config;
};
