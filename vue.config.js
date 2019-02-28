const path = require('path');

module.exports = {
  css: {
    extract: false,
  },
  transpileDependencies: ['bpmnlint'],
  configureWebpack: {
    resolve: {
      modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ],
      // symlinks: false,
      alias: {
        jointjs$: process.env.NODE_ENV === 'development'
          ? 'jointjs/dist/joint.js'
          : 'jointjs',
      },
    },
    module: {
      rules: [
        {
          test: /\.bpmnlintrc$/,
          use: 'bpmnlint-loader',
        },
      ],
    },
  },
};
