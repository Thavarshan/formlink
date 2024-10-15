import path from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['axios', 'lodash', 'vue'],
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          sourceMap: false,
          declaration: true,
          declarationMap: false,
          declarationDir: path.resolve(__dirname, 'dist/types'),
          outDir: path.resolve(__dirname, 'dist'),
          rootDir: path.resolve(__dirname, 'src'),
          exclude: ['src/types'],
        }),
      ],
    },
  },

  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },

  plugins: [],
});
