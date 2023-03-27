import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import svgLoader from 'vite-svg-loader';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import bpmnlint from 'rollup-plugin-bpmnlint';


import { resolve } from 'path';

const libraryName = 'modeler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [createVuePlugin(), svgLoader(), ViteYaml(), bpmnlint({
    include: '**/.bpmnlintrc',
  })],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
    extensions: ['.js', '.mjs', '.vue', '.json'],
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/components/index.js'),
      name: libraryName,
      fileName: (format) => `${libraryName}.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'moment', '@processmaker'],
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          moment: 'moment',
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
