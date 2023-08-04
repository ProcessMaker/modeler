module.exports = (on, config) => {
  if (config.env.inProcessmaker) {
    config.baseUrl = 'https://processmaker.local.processmaker.com';
  }

  require('@cypress/code-coverage/task')(on, config);

  return config;
};
