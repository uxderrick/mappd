import fs from 'node:fs';
import path from 'node:path';
import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import { parseFile, resolveImport } from '../analyzers/ast-utils.js';
import type { ParsedRoute } from '../types.js';

/**
 * Extract routes from a React Router v7 framework-mode project.
 *
 * Supports two v7 routing strategies:
 * 1. routes.ts config file using route(), index(), layout(), prefix() helpers
 * 2. File-based routing via @react-router/fs-routes (flatRoutes)
 *
 * Also scans route module files for loader/action redirects.
 */
export function extractReactRouterV7Routes(
  entryPoints: string[],
  projectDir: string,
): ParsedRoute[] {
  // Determine strategy: if entryPoint is a routes.ts file, parse it.
  // If it's a directory (app/routes/), do file-based scanning.
  const routes: ParsedRoute[] = [];

  for (const entry of entryPoints) {
    if (fs.statSync(entry).isDirectory()) {
      // File-based routing: scan app/routes/ directory
      routes.push(...extractFlatRoutes(entry, projectDir));
    } else {
      // Config-based: parse routes.ts
      routes.push(...extractRoutesConfig(entry, projectDir));
    }
  }

  return routes;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Strategy 1: routes.ts config parser
// ═══════════════════════════════════════════════════════════════════════════════

function extractRoutesConfig(routesFile: string, projectDir: string): ParsedRoute[] {
  const ast = parseFile(routesFile);
  const routes: ParsedRoute[] = [];

  // Check if this routes.ts uses flatRoutes() — delegate to file-based strategy
  let usesFlatRoutes = false;
  let flatRoutesRootDir: string | null = null;
  traverse(ast, {
    CallExpression(nodePath: any) {
      const callee = nodePath.node.callee;
      if (t.isIdentifier(callee) && callee.name === 'flatRoutes') {
        usesFlatRoutes = true;
        // Check for rootDirectory option: flatRoutes({ rootDirectory: 'app/custom' })
        const firstArg = nodePath.node.arguments[0];
        if (t.isObjectExpression(firstArg)) {
          for (const prop of firstArg.properties) {
            if (
              t.isObjectProperty(prop) &&
              t.isIdentifier(prop.key) &&
              prop.key.name === 'rootDirectory' &&
              t.isStringLiteral(prop.value)
            ) {
              flatRoutesRootDir = prop.value.value;
            }
          }
        }
        nodePath.stop();
      }
    },
  });

  if (usesFlatRoutes) {
    // flatRoutes() means file-based routing — scan the specified or default directory
    const routesDir = flatRoutesRootDir
      ? path.resolve(projectDir, flatRoutesRootDir)
      : path.join(projectDir, 'app', 'routes');
    if (fs.existsSync(routesDir)) {
      return extractFlatRoutes(routesDir, projectDir);
    }
    return [];
  }

  // Parse the default export array: export default [...] satisfies RouteConfig
  traverse(ast, {
    ExportDefaultDeclaration(nodePath: any) {
      let arrayNode: t.ArrayExpression | null = null;

      const decl = nodePath.node.declaration;
      // export default [...] or export default [...] satisfies RouteConfig
      if (t.isArrayExpression(decl)) {
        arrayNode = decl;
      } else if (
        t.isTSAsExpression(decl) || t.isTSSatisfiesExpression(decl)
      ) {
        if (t.isArrayExpression((decl as any).expression)) {
          arrayNode = (decl as any).expression;
        }
      }

      if (arrayNode) {
        routes.push(...parseV7RouteArray(arrayNode, '', routesFile, projectDir));
      }
    },
  });

  return routes;
}

function parseV7RouteArray(
  arr: t.ArrayExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] {
  const routes: ParsedRoute[] = [];

  for (const element of arr.elements) {
    if (!element) continue;

    // Handle spread: ...prefix("api", [...])
    if (t.isSpreadElement(element)) {
      if (t.isCallExpression(element.argument)) {
        const parsed = parseV7HelperCall(element.argument, parentPath, routesFile, projectDir);
        if (parsed) routes.push(...parsed);
      }
      continue;
    }

    if (t.isCallExpression(element)) {
      const parsed = parseV7HelperCall(element, parentPath, routesFile, projectDir);
      if (parsed) routes.push(...parsed);
    }
  }

  return routes;
}

/**
 * Parse a v7 helper call: route(), index(), layout(), prefix()
 */
function parseV7HelperCall(
  call: t.CallExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] | null {
  const callee = call.callee;
  if (!t.isIdentifier(callee)) return null;

  const helperName = callee.name;

  switch (helperName) {
    case 'route': return parseRouteHelper(call, parentPath, routesFile, projectDir);
    case 'index': return parseIndexHelper(call, parentPath, routesFile, projectDir);
    case 'layout': return parseLayoutHelper(call, parentPath, routesFile, projectDir);
    case 'prefix': return parsePrefixHelper(call, parentPath, routesFile, projectDir);
    default: return null;
  }
}

/**
 * route("path", "file.tsx") or route("path", "file.tsx", [...children])
 */
function parseRouteHelper(
  call: t.CallExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] {
  const args = call.arguments;
  if (args.length < 2) return [];

  const routePathLiteral = args[0];
  const fileLiteral = args[1];
  const childrenArg = args[2];

  if (!t.isStringLiteral(routePathLiteral)) return [];

  const routeSegment = routePathLiteral.value;
  const fullPath = buildFullPath(parentPath, routeSegment);

  let componentFilePath = '';
  let componentName = 'Unknown';

  if (t.isStringLiteral(fileLiteral)) {
    componentFilePath = resolveV7ModulePath(fileLiteral.value, routesFile, projectDir);
    componentName = deriveComponentName(fileLiteral.value);
  }

  const children: ParsedRoute[] = [];
  if (childrenArg && t.isArrayExpression(childrenArg)) {
    children.push(...parseV7RouteArray(childrenArg, fullPath, routesFile, projectDir));
  }

  const route: ParsedRoute = {
    path: fullPath,
    componentName,
    componentFilePath,
    isDynamic: fullPath.includes(':') || fullPath.includes('*'),
    isIndex: false,
    isLayout: children.length > 0,
    parentPath: parentPath || undefined,
    children: children.length > 0 ? children : undefined,
  };

  return [route, ...flattenChildren(children)];
}

/**
 * index("file.tsx")
 */
function parseIndexHelper(
  call: t.CallExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] {
  const args = call.arguments;
  if (args.length < 1) return [];

  const fileLiteral = args[0];
  let componentFilePath = '';
  let componentName = 'Unknown';

  if (t.isStringLiteral(fileLiteral)) {
    componentFilePath = resolveV7ModulePath(fileLiteral.value, routesFile, projectDir);
    componentName = deriveComponentName(fileLiteral.value);
  }

  return [{
    path: parentPath || '/',
    componentName,
    componentFilePath,
    isDynamic: false,
    isIndex: true,
    isLayout: false,
    parentPath: parentPath || undefined,
  }];
}

/**
 * layout("file.tsx", [...children])
 */
function parseLayoutHelper(
  call: t.CallExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] {
  const args = call.arguments;
  if (args.length < 1) return [];

  const fileLiteral = args[0];
  const childrenArg = args[1];

  let componentFilePath = '';
  let componentName = 'Unknown';

  if (t.isStringLiteral(fileLiteral)) {
    componentFilePath = resolveV7ModulePath(fileLiteral.value, routesFile, projectDir);
    componentName = deriveComponentName(fileLiteral.value) + 'Layout';
  }

  const children: ParsedRoute[] = [];
  if (childrenArg && t.isArrayExpression(childrenArg)) {
    children.push(...parseV7RouteArray(childrenArg, parentPath, routesFile, projectDir));
  }

  const route: ParsedRoute = {
    path: parentPath || '/',
    componentName,
    componentFilePath,
    isDynamic: false,
    isIndex: false,
    isLayout: true,
    parentPath: parentPath || undefined,
    children: children.length > 0 ? children : undefined,
  };

  return [route, ...flattenChildren(children)];
}

/**
 * prefix("api", [...children]) — adds path prefix without creating a route node
 */
function parsePrefixHelper(
  call: t.CallExpression,
  parentPath: string,
  routesFile: string,
  projectDir: string,
): ParsedRoute[] {
  const args = call.arguments;
  if (args.length < 2) return [];

  const prefixLiteral = args[0];
  const childrenArg = args[1];

  if (!t.isStringLiteral(prefixLiteral)) return [];

  const prefixedPath = buildFullPath(parentPath, prefixLiteral.value);

  if (childrenArg && t.isArrayExpression(childrenArg)) {
    return parseV7RouteArray(childrenArg, prefixedPath, routesFile, projectDir);
  }

  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Strategy 2: File-based flat routes
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_ROUTE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Parse flat-routes file conventions:
 * - _index.tsx           → index route
 * - concerts.trending.tsx → /concerts/trending (dot = path separator)
 * - $param.tsx           → /:param
 * - ($lang).tsx          → /:lang? (optional segment)
 * - $.tsx                → splat/catch-all
 * - _auth.login.tsx      → /login (leading _ = pathless layout group)
 * - concerts_.mine.tsx   → /concerts/mine (trailing _ = escape layout nesting)
 * - [sitemap.xml].tsx    → /sitemap.xml (escaped special chars)
 * - folder/route.tsx     → same as folder.tsx (folder-based module)
 */
export function extractFlatRoutes(routesDir: string, projectDir: string): ParsedRoute[] {
  if (!fs.existsSync(routesDir)) return [];

  const routes: ParsedRoute[] = [];
  const entries = fs.readdirSync(routesDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(routesDir, entry.name);

    if (entry.isDirectory()) {
      // Folder-based route module: check for route.tsx inside
      const routeFile = VALID_ROUTE_EXTENSIONS
        .map((ext) => path.join(fullPath, `route${ext}`))
        .find((f) => fs.existsSync(f));

      if (routeFile) {
        const routePath = flatFileNameToPath(entry.name);
        const componentName = deriveComponentName(entry.name);
        routes.push({
          path: routePath,
          componentName,
          componentFilePath: routeFile,
          isDynamic: routePath.includes(':') || routePath.includes('*'),
          isIndex: entry.name === '_index',
          isLayout: false,
          parentPath: getParentPath(routePath),
        });
      }
      continue;
    }

    // Skip non-route files
    const ext = path.extname(entry.name);
    if (!VALID_ROUTE_EXTENSIONS.includes(ext)) continue;

    const baseName = path.basename(entry.name, ext);

    // Skip test files, utils, etc.
    if (baseName.endsWith('.test') || baseName.endsWith('.spec')) continue;

    const routePath = flatFileNameToPath(baseName);
    const componentName = deriveComponentName(baseName);
    const isLayout = baseName.startsWith('_') && baseName !== '_index';

    routes.push({
      path: routePath,
      componentName,
      componentFilePath: fullPath,
      isDynamic: routePath.includes(':') || routePath.includes('*'),
      isIndex: baseName === '_index',
      isLayout,
      parentPath: getParentPath(routePath),
    });
  }

  return routes;
}

/**
 * Convert a flat-routes filename to a route path.
 *
 * Examples:
 *   _index          → /
 *   about           → /about
 *   concerts.trending → /concerts/trending
 *   concerts.$id    → /concerts/:id
 *   concerts.($id)  → /concerts/:id?
 *   $               → /*
 *   _auth.login     → /login (pathless layout prefix)
 *   concerts_.mine  → /concerts/mine (escaped nesting)
 *   [sitemap.xml]   → /sitemap.xml
 */
function flatFileNameToPath(name: string): string {
  if (name === '_index') return '/';
  if (name === '$') return '/*';

  // Process segments (split by dots, but respect brackets)
  const segments: string[] = [];
  let current = '';
  let bracketDepth = 0;

  for (const char of name) {
    if (char === '[') bracketDepth++;
    if (char === ']') bracketDepth--;
    if (char === '.' && bracketDepth === 0) {
      if (current) segments.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) segments.push(current);

  const pathParts: string[] = [];

  for (const segment of segments) {
    // Pathless layout: leading underscore (e.g., _auth) — skip from path
    if (segment.startsWith('_') && segment !== '_index') {
      continue;
    }

    // Trailing underscore: escape layout nesting (e.g., concerts_) — strip trailing _
    let seg = segment.endsWith('_') ? segment.slice(0, -1) : segment;

    // Escaped special chars: [sitemap.xml] → sitemap.xml
    if (seg.startsWith('[') && seg.endsWith(']')) {
      seg = seg.slice(1, -1);
      pathParts.push(seg);
      continue;
    }

    // Optional segment: ($lang) → :lang?
    if (seg.startsWith('(') && seg.endsWith(')')) {
      const inner = seg.slice(1, -1);
      if (inner.startsWith('$')) {
        pathParts.push(`:${inner.slice(1)}?`);
      } else {
        pathParts.push(inner);
      }
      continue;
    }

    // Dynamic segment: $param → :param
    if (seg.startsWith('$')) {
      if (seg === '$') {
        pathParts.push('*');
      } else {
        pathParts.push(`:${seg.slice(1)}`);
      }
      continue;
    }

    pathParts.push(seg);
  }

  return '/' + pathParts.join('/');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Shared helpers
// ═══════════════════════════════════════════════════════════════════════════════

function buildFullPath(parentPath: string, childPath: string): string {
  if (childPath.startsWith('/')) return childPath;
  if (!childPath) return parentPath || '/';
  const parent = parentPath.endsWith('/') ? parentPath : parentPath + '/';
  const full = parent + childPath;
  return full.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function resolveV7ModulePath(modulePath: string, routesFile: string, projectDir: string): string {
  // Module paths in routes.ts are relative to the routes file
  const resolved = resolveImport(modulePath, routesFile);
  if (resolved) return resolved;

  // Try relative to project app/ directory
  const appDir = path.join(projectDir, 'app');
  const fromApp = path.resolve(appDir, modulePath);
  for (const ext of VALID_ROUTE_EXTENSIONS) {
    if (fs.existsSync(fromApp + ext)) return fromApp + ext;
  }
  if (fs.existsSync(fromApp)) return fromApp;

  return '';
}

function deriveComponentName(fileOrName: string): string {
  const base = path.basename(fileOrName).replace(/\.\w+$/, '');
  if (base === '_index' || base === 'index') return 'IndexPage';

  // Clean up: remove $, _, dots, brackets
  const cleaned = base
    .replace(/^\$/, '')
    .replace(/\$$/, '')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/\./g, '-')
    .replace(/[\[\]()]/g, '');

  const parts = cleaned.split(/[-.]/).filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Page';
}

function getParentPath(routePath: string): string | undefined {
  if (!routePath || routePath === '/') return undefined;
  const parts = routePath.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

function flattenChildren(routes: ParsedRoute[]): ParsedRoute[] {
  const flat: ParsedRoute[] = [];
  for (const route of routes) {
    if (route.children) {
      flat.push(...flattenChildren(route.children));
    }
  }
  return flat;
}
