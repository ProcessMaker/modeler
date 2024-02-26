import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import svgLoader from 'vite-svg-loader';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import bpmnlint from 'rollup-plugin-bpmnlint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


import { resolve } from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const libraryName = 'modeler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // nodePolyfills({
    //   globals: {
    //     Buffer: true,
    //     process: true,
    //   },
    // }),
    cssInjectedByJsPlugin(),
    svgLoader({
      defaultImport: 'url',
      svgo: false,
    }),
    ViteYaml(),
    bpmnlint({
      include: '**/.bpmnlintrc',
    }),
  ],
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm.js',
      },
    ],
    extensions: ['.js', '.mjs', '.vue', '.json'],
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/components/nodes/index.js'),
      name: libraryName,
      formats: ['es', 'cjs'],
      fileName: (format) => `${libraryName}.${format}.js`,
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'moment', 'moment-timezone', 'lodash', '@processmaker/vue-multiselect', '@processmaker/vue-form-elements', '@processmaker/screen-builder', 'i18next', '@panter/vue-i18next'],
      output: {
        exports: 'named',
        assetFileNames: 'modeler.[ext]',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          moment: 'moment',
          'moment-timezone': 'moment-timezone',
          lodash: 'lodash',
          '@processmaker/vue-multiselect': 'VueMultiselect',
          '@processmaker/vue-form-elements': 'VueFormElements',
          '@processmaker/screen-builder': 'ScreenBuilder',
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import '@/assets/scss/settings/_settings.variables.scss';
        @import '@/assets/scss/tools/_tools.chevron.scss';
        `,
      },
    },
  },
});
