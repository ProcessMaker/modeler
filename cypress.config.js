const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  fixturesFolder: 'tests/e2e/fixtures',
  // integrationFolder: 'tests/e2e/specs',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  // supportFile: 'tests/e2e/support/index.js',

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./tests/e2e/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:8080',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
  },

  component: {
    devServer: {
      framework: 'vue-cli',
      bundler: 'webpack',
    },
  },
});
