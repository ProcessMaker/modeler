module.exports = (on, config) => {
  if (config.env.inProcessmaker) {
    config.baseUrl = 'https://processmaker.local.processmaker.com';
  }

  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args = launchOptions.args.map((arg) => {
        if (arg === '--headless') {
          return '--headless=new';
        }

        return arg;
      });
    }

    return launchOptions;
  });

  require('@cypress/code-coverage/task')(on, config);

  require('cypress-terminal-report/src/installLogsPrinter')(on, {
    // printLogsToConsole: 'always',
    // collectTypes: ['cons:log'],
  });

  return config;
};
