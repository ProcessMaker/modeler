const path = require('path');

module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    resolve: {
      modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ],
      symlinks: false,
    },
  },
};
