module.exports = (api) => {
  const isProd = api.env('production');
  api.cache.using(() => isProd);

  return {
    presets: [
      '@vue/cli-plugin-babel/preset',
    ],
    plugins: isProd ? [] : ['istanbul'],
    sourceType: 'unambiguous',
  };
};
