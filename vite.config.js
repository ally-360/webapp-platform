// https://github.com/vitejs/vite/discussions/3448
import path from 'path';
import fs from 'fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  server: {
    open: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }));
          },
        },
      ],
    },
  },
});
