import fs from 'node:fs';
import path from 'node:path';
import type { FrameworkDetection } from './types.js';

const ROUTER_ENTRY_CANDIDATES = [
  'src/main.tsx', 'src/main.ts', 'src/main.jsx', 'src/main.js',
  'src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js',
  'src/App.tsx', 'src/App.ts', 'src/App.jsx', 'src/App.js',
  'src/router.tsx', 'src/router.ts', 'src/routes.tsx', 'src/routes.ts',
  'app/layout.tsx', 'app/layout.ts', 'app/layout.jsx', 'app/layout.js',
];

export function detectFramework(projectDir: string): FrameworkDetection {
  // Check for Next.js
  const nextConfigs = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
  const isNextjs = nextConfigs.some((f) => fs.existsSync(path.join(projectDir, f)));

  if (isNextjs) {
    const hasAppDir = fs.existsSync(path.join(projectDir, 'app'));
    const hasSrcAppDir = fs.existsSync(path.join(projectDir, 'src', 'app'));
    const hasPagesDir = fs.existsSync(path.join(projectDir, 'pages'));
    const hasSrcPagesDir = fs.existsSync(path.join(projectDir, 'src', 'pages'));

    if (hasAppDir || hasSrcAppDir) {
      return {
        framework: 'nextjs-app',
        entryPoints: [hasAppDir ? path.join(projectDir, 'app') : path.join(projectDir, 'src', 'app')],
      };
    }

    if (hasPagesDir || hasSrcPagesDir) {
      return {
        framework: 'nextjs-pages',
        entryPoints: [hasPagesDir ? path.join(projectDir, 'pages') : path.join(projectDir, 'src', 'pages')],
      };
    }

    throw new Error('Next.js project detected but no /app or /pages directory found.');
  }

  // Check for React Router in package.json
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['react-router-dom'] || deps['react-router']) {
      // Find entry file that contains router setup
      const entryPoints: string[] = [];

      for (const candidate of ROUTER_ENTRY_CANDIDATES) {
        const fullPath = path.join(projectDir, candidate);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (
            content.includes('createBrowserRouter') ||
            content.includes('createHashRouter') ||
            content.includes('BrowserRouter') ||
            content.includes('<Route') ||
            content.includes('RouterProvider')
          ) {
            entryPoints.push(fullPath);
          }
        }
      }

      if (entryPoints.length === 0) {
        // Fallback: just use the first existing candidate
        for (const candidate of ROUTER_ENTRY_CANDIDATES) {
          const fullPath = path.join(projectDir, candidate);
          if (fs.existsSync(fullPath)) {
            entryPoints.push(fullPath);
            break;
          }
        }
      }

      return { framework: 'react-router', entryPoints };
    }
  }

  throw new Error(
    'Could not detect routing framework. Mappd supports React Router v6+ and Next.js.'
  );
}
