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
  // Try direct detection first, then monorepo sub-apps
  const direct = tryDetectFramework(projectDir);
  if (direct) return direct;

  // Monorepo: scan apps/*/ and packages/*/ for sub-projects
  const monorepoGlobs = ['apps', 'packages'];
  for (const dir of monorepoGlobs) {
    const appsDir = path.join(projectDir, dir);
    if (!fs.existsSync(appsDir)) continue;

    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const subDir = path.join(appsDir, entry.name);
      const result = tryDetectFramework(subDir);
      if (result) {
        return result;
      }
    }
  }

  throw new Error(
    'Could not detect routing framework. FlowCanvas supports React Router v6+/v7 and Next.js.\n' +
    'If this is a monorepo, make sure --dir points to the app directory (e.g., --dir apps/dashboard).'
  );
}

function tryDetectFramework(projectDir: string): FrameworkDetection | null {
  // Check for Next.js (all config variants including .ts)
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

    return null;
  }

  // Check for React Router v7 framework mode (@react-router/dev + react-router.config.ts)
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // v7 framework mode: uses @react-router/dev and has app/routes.ts
    if (deps['@react-router/dev'] || deps['@react-router/node'] || deps['@react-router/cloudflare']) {
      const routesTsFiles = ['app/routes.ts', 'app/routes.tsx', 'app/routes.js', 'src/routes.ts', 'src/routes.tsx'];
      const routesTsPath = routesTsFiles.find((f) => fs.existsSync(path.join(projectDir, f)));
      const configFiles = ['react-router.config.ts', 'react-router.config.js'];
      const hasConfig = configFiles.some((f) => fs.existsSync(path.join(projectDir, f)));

      if (routesTsPath || hasConfig) {
        // Check if using flatRoutes (file-based) or manual routes.ts config
        const entryPoints: string[] = [];
        if (routesTsPath) {
          entryPoints.push(path.join(projectDir, routesTsPath));
        }
        return { framework: 'react-router-v7', entryPoints };
      }

      // v7 with flat routes but no explicit routes.ts — check for app/routes/ directory
      const hasRoutesDir = fs.existsSync(path.join(projectDir, 'app', 'routes'));
      if (hasRoutesDir) {
        return {
          framework: 'react-router-v7',
          entryPoints: [path.join(projectDir, 'app', 'routes')],
        };
      }
    }

    // v6/v7 SPA mode: uses react-router-dom or react-router directly
    if (deps['react-router-dom'] || deps['react-router']) {
      const entryPoints: string[] = [];

      for (const candidate of ROUTER_ENTRY_CANDIDATES) {
        const fullPath = path.join(projectDir, candidate);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (
            content.includes('createBrowserRouter') ||
            content.includes('createHashRouter') ||
            content.includes('createMemoryRouter') ||
            content.includes('BrowserRouter') ||
            content.includes('<Route') ||
            content.includes('RouterProvider')
          ) {
            entryPoints.push(fullPath);
          }
        }
      }

      if (entryPoints.length === 0) {
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

  return null;
}
