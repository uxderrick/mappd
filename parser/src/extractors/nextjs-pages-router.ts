import fs from 'node:fs';
import path from 'node:path';
import type { ParsedRoute } from '../types.js';

const VALID_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const SKIP_FILES = ['_app', '_document', '_error', '404', '500'];

/**
 * Extract routes from a Next.js Pages Router project by scanning the /pages directory.
 */
export function extractNextjsPagesRoutes(pagesDir: string): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  scanDirectory(pagesDir, '', pagesDir, routes);
  return routes;
}

function scanDirectory(
  dir: string,
  routePath: string,
  pagesDir: string,
  routes: ParsedRoute[],
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'api') continue; // Skip API routes
      if (entry.name.startsWith('_')) continue;

      const childPath = buildRoutePath(routePath, entry.name);
      scanDirectory(fullPath, childPath, pagesDir, routes);
      continue;
    }

    // Process files
    const ext = path.extname(entry.name);
    if (!VALID_EXTENSIONS.includes(ext)) continue;

    const baseName = path.basename(entry.name, ext);
    if (SKIP_FILES.includes(baseName)) continue;

    const fileRoutePath = baseName === 'index'
      ? routePath || '/'
      : buildRoutePath(routePath, baseName);

    const componentName = getComponentName(fileRoutePath);

    routes.push({
      path: fileRoutePath,
      componentName,
      componentFilePath: fullPath,
      isDynamic: fileRoutePath.includes(':'),
      isIndex: baseName === 'index',
      isLayout: false,
      parentPath: getParentPath(fileRoutePath),
    });
  }
}

/**
 * Build a route path from a file/directory name.
 * Handles: [param] → :param, [...slug] → :slug*
 */
function buildRoutePath(parentPath: string, name: string): string {
  // Catch-all: [...slug]
  if (name.startsWith('[...') && name.endsWith(']')) {
    const param = name.slice(4, -1);
    return `${parentPath}/:${param}*`;
  }

  // Optional catch-all: [[...slug]]
  if (name.startsWith('[[...') && name.endsWith(']]')) {
    const param = name.slice(5, -2);
    return `${parentPath}/:${param}*`;
  }

  // Dynamic segment: [id]
  if (name.startsWith('[') && name.endsWith(']')) {
    const param = name.slice(1, -1);
    return `${parentPath}/:${param}`;
  }

  return `${parentPath}/${name}`;
}

function getComponentName(routePath: string): string {
  if (!routePath || routePath === '/') return 'IndexPage';

  const segments = routePath
    .split('/')
    .filter(Boolean)
    .map((s) => {
      if (s.startsWith(':')) s = s.replace(/^:/, '').replace(/\*$/, '');
      return s.charAt(0).toUpperCase() + s.slice(1);
    });

  return segments.join('') + 'Page';
}

function getParentPath(routePath: string): string | undefined {
  if (!routePath || routePath === '/') return undefined;
  const parts = routePath.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}
