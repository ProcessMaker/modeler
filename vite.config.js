import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import svgLoader from 'vite-svg-loader';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import bpmnlint from 'rollup-plugin-bpmnlint';
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

import { resolve } from 'path';

const libraryName = 'modeler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    svgLoader(),
    ViteYaml(),
    topLevelAwait(),
    wasm(),
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
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/components/index.js'),
      name: libraryName,
      fileName: (format) => `${libraryName}.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'moment', 'moment-timezone', '@processmaker'],
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          moment: 'moment',
          'moment-timezone': 'moment-timezone',
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
  optimizeDeps: {
    // This is necessary because otherwise `vite dev` includes two separate
    // versions of the JS wrapper. This causes problems because the JS
    // wrapper has a module level variable to track JS side heap
    // allocations, initializing this twice causes horrible breakage
    exclude: ["@automerge/automerge-wasm"],
  },
});
