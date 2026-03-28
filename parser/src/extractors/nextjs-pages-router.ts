import fs from 'node:fs';
import path from 'node:path';
import type { ParsedRoute } from '../types.js';

/**
 * Detect the layout pattern used in a Pages Router page file.
 * Returns 'getLayout' | 'inline' | 'pageWrapper' | undefined.
 */
function detectLayoutPattern(filePath: string): ParsedRoute['layoutPattern'] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Check for getLayout pattern: Page.getLayout = ...
    if (content.includes('.getLayout') || content.includes('getLayout:')) {
      return 'getLayout';
    }
    // Check for PageWrapper pattern: Page.PageWrapper = ... (Cal.com)
    if (content.includes('.PageWrapper') || content.includes('PageWrapper:')) {
      return 'pageWrapper';
    }
    // Check for inline layout wrapping: common layout component imports
    if (
      content.includes('AppLayout') ||
      content.includes('DashboardLayout') ||
      content.includes('MainLayout') ||
      content.includes('SiteLayout') ||
      content.includes('AdminLayout')
    ) {
      return 'inline';
    }
  } catch { /* skip */ }
  return undefined;
}

const DEFAULT_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const SKIP_FILES = ['_app', '_document', '_error', '404', '500'];

/**
 * Extract routes from a Next.js Pages Router project by scanning the /pages directory.
 * Optionally accepts custom pageExtensions from next.config.
 */
export function extractNextjsPagesRoutes(
  pagesDir: string,
  pageExtensions?: string[],
): ParsedRoute[] {
  // Build valid extensions list from pageExtensions config
  const validExtensions = pageExtensions
    ? pageExtensions.map((ext) => ext.startsWith('.') ? ext : `.${ext}`)
    : DEFAULT_EXTENSIONS;

  const routes: ParsedRoute[] = [];
  scanDirectory(pagesDir, '', pagesDir, routes, validExtensions);
  return routes;
}

function scanDirectory(
  dir: string,
  routePath: string,
  pagesDir: string,
  routes: ParsedRoute[],
  validExtensions: string[],
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'api') continue; // Skip API routes
      if (entry.name.startsWith('_')) continue;

      const childPath = buildRoutePath(routePath, entry.name);
      scanDirectory(fullPath, childPath, pagesDir, routes, validExtensions);
      continue;
    }

    // Process files
    const ext = path.extname(entry.name);
    if (!validExtensions.includes(ext)) continue;

    // For custom pageExtensions like 'page.tsx', handle compound extensions
    const baseName = getBaseName(entry.name, validExtensions);
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
      layoutPattern: detectLayoutPattern(fullPath),
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
    .flatMap((s) => {
      if (s.startsWith(':')) s = s.replace(/^:/, '').replace(/\*$/, '');
      return s.split('-').filter(Boolean);
    })
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return segments.join('') + 'Page';
}

function getParentPath(routePath: string): string | undefined {
  if (!routePath || routePath === '/') return undefined;
  const parts = routePath.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

/**
 * Get the base name of a file, handling compound extensions like '.page.tsx'.
 * For custom pageExtensions (e.g., ['page.tsx', 'page.ts']), strip the full compound extension.
 */
function getBaseName(fileName: string, validExtensions: string[]): string {
  // Sort by length descending so compound extensions match first
  const sorted = [...validExtensions].sort((a, b) => b.length - a.length);
  for (const ext of sorted) {
    const dotExt = ext.startsWith('.') ? ext : `.${ext}`;
    if (fileName.endsWith(dotExt)) {
      return fileName.slice(0, -dotExt.length);
    }
  }
  // Fallback to standard extname
  return path.basename(fileName, path.extname(fileName));
}
