module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['@vue/app'],
    plugins: ['istanbul', '@babel/plugin-proposal-private-methods'],
    sourceType: 'unambiguous',
  };
};
