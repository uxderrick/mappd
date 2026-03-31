import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  // Inject createRequire shim so bundled CJS packages (commander, ws, chokidar)
  // can use require() for Node built-ins inside the ESM output
  shims: true,
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
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __cr } from "node:module";',
      'const require = __cr(import.meta.url);',
    ].join('\n'),
  },
});
