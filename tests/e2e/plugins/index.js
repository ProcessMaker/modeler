module.exports = (on, config) => {
  if (config.env.inProcessmaker) {
    config.baseUrl = 'https://processmaker.local.processmaker.com';
  }

  require('@cypress/code-coverage/task')(on, config);
  // on('file:preprocessor', require('@cypress/code-coverage/use-browserify-istanbul'));

  return config;
};
