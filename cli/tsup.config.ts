import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  // Keep as runtime deps (not bundled):
  // - express: too many dynamic requires
  // - puppeteer: ships native browser binaries
  external: ['express', 'puppeteer', 'fsevents'],
  // Bundle everything else into the output
  noExternal: [
    'mappd-parser',
    'commander',
    'picocolors',
    'chokidar',
    'ws',
    'dagre',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
  ],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
