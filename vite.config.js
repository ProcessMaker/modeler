import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import bpmnlint from 'rollup-plugin-bpmnlint';
import { resolve } from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import vitePluginRequire from 'vite-plugin-require';
import svgLoader from 'vite-svg-loader';

const libraryName = 'modeler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginRequire(),
    svgLoader(
      {
        defaultImport: 'url',
      },
    ),
    cssInjectedByJsPlugin(),
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
      external: [
        'vue',
        'moment',
        'moment-timezone',
        'lodash',
        'i18next',
        '@panter/vue-i18next',
        'jointjs',
        'luxon',
        'bpmn-moddle',
        /^bootstrap\/.+$/,
        /^@processmaker\/(?!processmaker-bpmn-moddle).+$/,
        /^@fortawesome\/.+$/,
      ],
      output: {
        exports: 'named',
        assetFileNames: 'modeler.[ext]',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          moment: 'moment',
          'moment-timezone': 'moment-timezone',
          lodash: '_',
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
