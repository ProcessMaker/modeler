module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['@vue/cli-plugin-babel/preset'],
    sourceType: 'unambiguous',
  };
};
