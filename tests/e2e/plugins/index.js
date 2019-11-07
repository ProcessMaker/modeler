const webpack = require('@cypress/webpack-preprocessor');

module.exports = (on, config) => {
  if (config.env.inProcessmaker) {
    config.baseUrl = 'https://processmaker.local.processmaker.com';
  }
  
  on('task', require('@cypress/code-coverage/task'));
  on('file:preprocessor', require('@cypress/code-coverage/use-browserify-istanbul'));
  on('file:preprocessor', webpack({
    webpackOptions: require('@vue/cli-service/webpack.config.js'),
  }));

  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js',
  });
};
