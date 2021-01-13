const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const yargs = require('yargs');
const CopyPlugin = require('copy-webpack-plugin');
// eslint-disable-next-line no-unused-vars
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  runtimeCompiler: true,
  css: {
    extract: false,
    loaderOptions: {
      sass: {
        prependData: `
          @import '@/assets/scss/settings/_settings.variables.scss';
          @import '@/assets/scss/tools/_tools.chevron.scss';
        `,
      },
    },
  },
  transpileDependencies: ['bpmnlint'],
  configureWebpack: {
    resolve: {
      modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ],
      symlinks: false,
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
    externals: (() => {
      const externals = [];
      if (process.env.NODE_ENV === 'production') {
        externals.push(
          'vue',
          /^bootstrap\/.+$/,
          /^@processmaker\/(?!processmaker-bpmn-moddle).+$/,
          /^@fortawesome\/.+$/,
          'jointjs',
          'i18next',
          '@panter/vue-i18next',
          'luxon',
          'lodash',
          'bpmn-moddle',
        );
      }
      return externals;
    })(),
    plugins: (() => {
      const argv = yargs
        .boolean('analyze')
        .argv;
      const plugins = [];
      if (argv.analyze) {
        plugins.push(new BundleAnalyzerPlugin());
      }

      /* copy files required for dynamic import of rich text editor */
      plugins.push(new CopyPlugin([{
        from: path.resolve(__dirname, 'node_modules/@processmaker/vue-form-elements/dist'),
        to: path.resolve(__dirname, 'public/js'),
        ignore: ['demo.html'],
      }]));

      /* use this plugin to find issues related to circular dependencies */
      // plugins.push(new CircularDependencyPlugin({
      //   // exclude detection of files based on a RegExp
      //   exclude: /a\.js|node_modules/,
      //   // include specific files based on a RegExp
      //   include: /src/,
      //   // add errors to webpack instead of warnings
      //   failOnError: true,
      //   // allow import cycles that include an asyncronous import,
      //   // e.g. via import(/* webpackMode: "weak" */ './file.js')
      //   allowAsyncCycles: false,
      //   // set the current working directory for displaying module paths
      //   cwd: process.cwd(),
      // }));

      return plugins;
    })(),
  },
};
