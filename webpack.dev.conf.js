//Used only for alias resolution by IDE's such as PHPStorm or Webstorm.
const path = require('path');

module.exports = {
  entry: {
    app: './src/main.js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, 'src'),
    },
  },
};
