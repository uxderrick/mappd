import fs from 'node:fs';
import path from 'node:path';
import type { ParsedRoute } from '../types.js';

const PAGE_FILES = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
const LAYOUT_FILES = ['layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js'];
const ROUTE_FILES = ['route.tsx', 'route.ts', 'route.jsx', 'route.js'];
const DEFAULT_FILES = ['default.tsx', 'default.ts', 'default.jsx', 'default.js'];

/**
 * Extract routes from a Next.js App Router project by scanning the /app directory.
 */
export function extractNextjsAppRoutes(appDir: string): ParsedRoute[] {
  const routes: ParsedRoute[] = [];
  scanDirectory(appDir, '', appDir, routes);
  detectRouteGroupConflicts(routes);
  return routes;
}

function scanDirectory(
  dir: string,
  routePath: string,
  appDir: string,
  routes: ParsedRoute[],
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // ── Gap #4: Skip route.ts/route.js files (API routes) — they have no UI ──
  const hasRouteFile = ROUTE_FILES.some((f) => fs.existsSync(path.join(dir, f)));

  // ── Gap #5: Recognize default.tsx but don't create route nodes ──
  // default.tsx is a fallback for parallel route slots — we acknowledge it
  // but intentionally do NOT push a route node for it.
  // (No code needed here; we just don't scan DEFAULT_FILES for route creation.)

  // Check for page file in this directory (skip if this dir is an API route)
  if (!hasRouteFile) {
    for (const pageFile of PAGE_FILES) {
      const pagePath = path.join(dir, pageFile);
      if (fs.existsSync(pagePath)) {
        const componentName = getComponentName(pagePath, routePath);
        const isOptionalCatchAll = routePath.endsWith('*?');
        routes.push({
          path: routePath || '/',
          componentName,
          componentFilePath: pagePath,
          isDynamic: routePath.includes(':'),
          isIndex: routePath === '' || routePath === '/',
          isLayout: false,
          isOptionalCatchAll,
          parentPath: getParentPath(routePath),
        });
        break;
      }
    }
  }

  // Check for layout file (skip if this dir is an API route)
  if (!hasRouteFile) {
    for (const layoutFile of LAYOUT_FILES) {
      const layoutPath = path.join(dir, layoutFile);
      if (fs.existsSync(layoutPath) && routePath !== '') {
        // Don't add root layout as a route — it wraps everything
        const componentName = getComponentName(layoutPath, routePath) + 'Layout';
        routes.push({
          path: routePath,
          componentName,
          componentFilePath: layoutPath,
          isDynamic: routePath.includes(':'),
          isIndex: false,
          isLayout: true,
          parentPath: getParentPath(routePath),
        });
        break;
      }
    }
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    // ── Gap #6: Only skip literal `_` prefix, not `%5F` prefix ──
    // Folders starting with `%5F` are URL-encoded underscores and ARE routable.
    if (entry.name.startsWith('_')) continue;

    const childPath = buildRoutePath(routePath, entry.name);
    scanDirectory(path.join(dir, entry.name), childPath, appDir, routes);
  }
}

/**
 * Build a route path from a directory name.
 * Handles:
 *   [param]          → :param
 *   [...slug]        → :slug*
 *   [[...slug]]      → :slug*?  (optional catch-all — matches parent path too)
 *   (group)          → strip (route group)
 *   @folder          → strip (parallel route slot)
 *   (.) (..) etc.    → strip (intercepting route prefix)
 */
function buildRoutePath(parentPath: string, dirName: string): string {
  // ── Gap #3: Intercepting routes — strip the convention prefix ──
  // Conventions: (.), (..), (..)(..), (...)
  const interceptPrefixes = ['(...)', '(..)(..)', '(..)', '(.)'];
  for (const prefix of interceptPrefixes) {
    if (dirName.startsWith(prefix)) {
      const rest = dirName.slice(prefix.length);
      if (rest === '') {
        // The entire folder name IS the intercept marker — no extra segment
        return parentPath;
      }
      // e.g. "(.)photo" → treat "photo" as the segment name, recurse logic
      return buildRoutePath(parentPath, rest);
    }
  }

  // Route groups: (marketing) → skip in path
  if (dirName.startsWith('(') && dirName.endsWith(')')) {
    return parentPath;
  }

  // ── Gap #2: Parallel route slots: @folder → strip from path ──
  if (dirName.startsWith('@')) {
    return parentPath;
  }

  // ── Gap #7: Optional catch-all: [[...slug]] → :slug*? ──
  // Matches the parent path AND any sub-paths.
  if (dirName.startsWith('[[...') && dirName.endsWith(']]')) {
    const param = dirName.slice(5, -2);
    return `${parentPath}/:${param}*?`;
  }

  // Catch-all: [...slug] → :slug*
  if (dirName.startsWith('[...') && dirName.endsWith(']')) {
    const param = dirName.slice(4, -1);
    return `${parentPath}/:${param}*`;
  }

  // Dynamic segment: [id] → :id
  if (dirName.startsWith('[') && dirName.endsWith(']')) {
    const param = dirName.slice(1, -1);
    return `${parentPath}/:${param}`;
  }

  // Regular segment
  return `${parentPath}/${dirName}`;
}

/**
 * Derive a component name from the file path and route.
 */
function getComponentName(filePath: string, routePath: string): string {
  if (!routePath || routePath === '/') return 'HomePage';

  // Convert /dashboard/settings → DashboardSettingsPage
  const segments = routePath
    .split('/')
    .filter(Boolean)
    .map((s) => {
      // Strip dynamic markers  :slug*? → slug
      if (s.startsWith(':')) s = s.replace(/^:/, '').replace(/\*\??$/, '');
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

/**
 * ── Gap #8: Detect route group conflicts ──
 * If two different source directories produce the same route path (common with
 * route groups), log a warning. We don't crash — just inform the developer.
 */
function detectRouteGroupConflicts(routes: ParsedRoute[]): void {
  const seen = new Map<string, string>(); // path → first componentFilePath
  for (const route of routes) {
    if (route.isLayout) continue; // layouts legitimately share paths
    const existing = seen.get(route.path);
    if (existing && existing !== route.componentFilePath) {
      console.warn(
        `[flowcanvas] Route conflict: path "${route.path}" is defined by both:\n` +
          `  - ${existing}\n` +
          `  - ${route.componentFilePath}\n` +
          `  This usually happens when multiple route groups produce the same URL.`,
      );
    } else {
      seen.set(route.path, route.componentFilePath);
    }
  }
}
