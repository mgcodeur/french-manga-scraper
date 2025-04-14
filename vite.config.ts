import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'node20',
    outDir: 'dist',
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/index.ts'),
        cli: path.resolve(__dirname, 'src/interface/cli/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        'inquirer',
        'mute-stream',
        'yoctocolors',
        '@inquirer/core',
        '@inquirer/editor',
        '@inquirer/figures',
        'external-editor',
        'chardet',
        'cli-width',
        'tmp',
        'axios',
        'chalk',
        'cheerio',
        'commander',
        'dotenv',
        'ora',
        'nodemailer',
        'fs',
        'path',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
