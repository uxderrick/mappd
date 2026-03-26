import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import { parseFile, getImportMap, resolveImport } from '../analyzers/ast-utils.js';
import type { ParsedRoute } from '../types.js';

/**
 * Extract routes from a React Router v6+ project.
 * Handles:
 *  - createBrowserRouter / createHashRouter / createMemoryRouter (object-style config)
 *  - JSX <Routes><Route ... /></Routes> (component-style config)
 *
 * Notes for future work:
 *  - `caseSensitive` boolean on route objects/elements is recognised but not yet
 *    surfaced in ParsedRoute. When the schema gains a `caseSensitive` field, wire it up.
 *  - `errorElement` / `ErrorBoundary` properties define alternative error UI.
 *    They do NOT create separate route nodes; they are informational only.
 *    Consider exposing them as metadata on ParsedRoute in the future.
 *  - `<Navigate to="..." />` (declarative redirect) belongs in the link/edge detector,
 *    not the route extractor.
 *  - `redirect()` calls inside `loader`/`action` also belong in the link/edge detector.
 */
export function extractReactRouterRoutes(entryFile: string): ParsedRoute[] {
  const ast = parseFile(entryFile);
  const importMap = getImportMap(ast, entryFile);
  const tree: ParsedRoute[] = [];

  // ── Pass 1: object-style route config (createBrowserRouter etc.) ──────────
  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      if (!t.isIdentifier(callee)) return;

      if (
        callee.name !== 'createBrowserRouter' &&
        callee.name !== 'createHashRouter' &&
        callee.name !== 'createMemoryRouter'
      ) {
        return;
      }

      const firstArg = path.node.arguments[0];

      // Direct array: createBrowserRouter([...])
      if (t.isArrayExpression(firstArg)) {
        tree.push(...parseRouteArray(firstArg, '', importMap, entryFile));
        return;
      }

      // Handle: createBrowserRouter(createRoutesFromElements(<Route>...</Route>))
      if (t.isCallExpression(firstArg) && t.isIdentifier(firstArg.callee)) {
        if (firstArg.callee.name === 'createRoutesFromElements' || firstArg.callee.name === 'createRoutesFromChildren') {
          const jsxArg = firstArg.arguments[0];
          if (t.isJSXElement(jsxArg)) {
            // Parse the JSX Route tree
            tree.push(...parseJSXRouteChildren(jsxArg.children, '', importMap));
          }
          return;
        }
      }

      // Handle: createBrowserRouter(routeConfig) where routeConfig is a variable
      if (t.isIdentifier(firstArg)) {
        // Check if it's a local variable in this file
        const binding = path.scope.getBinding(firstArg.name);
        if (binding && t.isVariableDeclarator(binding.path.node)) {
          const init = binding.path.node.init;
          if (t.isArrayExpression(init)) {
            tree.push(...parseRouteArray(init, '', importMap, entryFile));
          }
        }

        // Check if it's an import — resolve and parse the imported file
        if (!binding || tree.length === 0) {
          const info = importMap.get(firstArg.name);
          if (info?.resolvedPath) {
            // Re-parse the imported file looking for the exported array
            const importedAst = parseFile(info.resolvedPath);
            const importedImportMap = getImportMap(importedAst, info.resolvedPath);
            traverse(importedAst, {
              VariableDeclarator(innerPath: any) {
                if (!t.isIdentifier(innerPath.node.id)) return;
                const init = innerPath.node.init;
                if (t.isArrayExpression(init)) {
                  tree.push(...parseRouteArray(init, '', importedImportMap, info.resolvedPath!));
                }
              },
            });
          }
        }
      }
    },
  });

  // ── Pass 2: JSX <Routes><Route … /></Routes> ─────────────────────────────
  traverse(ast, {
    JSXElement(path: { node: t.JSXElement; skip: () => void }) {
      const opening = path.node.openingElement;
      if (!isJSXName(opening.name, 'Routes')) return;

      // Walk direct JSX children that are <Route> elements
      const jsxRoutes = parseJSXRouteChildren(path.node.children, '', importMap);
      tree.push(...jsxRoutes);

      // Don't traverse into nested <Routes> — they are independent route scopes.
      path.skip();
    },
  });

  // ── Pass 3: useRoutes([...]) hook ───────────────────────────────────────────
  traverse(ast, {
    CallExpression(path: any) {
      const callee = path.node.callee;
      if (!t.isIdentifier(callee) || callee.name !== 'useRoutes') return;

      const firstArg = path.node.arguments[0];

      // useRoutes([...])
      if (t.isArrayExpression(firstArg)) {
        tree.push(...parseRouteArray(firstArg, '', importMap, entryFile));
        return;
      }

      // useRoutes(routeConfig) where routeConfig is a variable reference
      if (t.isIdentifier(firstArg)) {
        const binding = path.scope.getBinding(firstArg.name);
        if (binding && t.isVariableDeclarator(binding.path.node)) {
          const init = binding.path.node.init;
          if (t.isArrayExpression(init)) {
            tree.push(...parseRouteArray(init, '', importMap, entryFile));
          }
        }

        // Check if it's an import
        if (!binding || tree.length === 0) {
          const info = importMap.get(firstArg.name);
          if (info?.resolvedPath) {
            const importedAst = parseFile(info.resolvedPath);
            const importedImportMap = getImportMap(importedAst, info.resolvedPath);
            traverse(importedAst, {
              VariableDeclarator(innerPath: any) {
                if (!t.isIdentifier(innerPath.node.id)) return;
                const init = innerPath.node.init;
                if (t.isArrayExpression(init)) {
                  tree.push(...parseRouteArray(init, '', importedImportMap, info.resolvedPath!));
                }
              },
            });
          }
        }
      }
    },
  });

  // Flatten the tree into a flat list of all routes
  return flattenRoutes(tree);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Object-style route parsing
// ═══════════════════════════════════════════════════════════════════════════════

function parseRouteArray(
  arr: t.ArrayExpression,
  parentPath: string,
  importMap: Map<string, { source: string; importedName: string; resolvedPath: string | null }>,
  entryFile: string,
): ParsedRoute[] {
  const routes: ParsedRoute[] = [];

  for (const element of arr.elements) {
    if (!t.isObjectExpression(element)) continue;
    const route = parseRouteObject(element, parentPath, importMap, entryFile);
    if (route) routes.push(route);
  }

  return routes;
}

function parseRouteObject(
  obj: t.ObjectExpression,
  parentPath: string,
  importMap: Map<string, { source: string; importedName: string; resolvedPath: string | null }>,
  entryFile: string,
): ParsedRoute | null {
  let routePath: string | null = null;
  let componentName = 'Unknown';
  let componentFilePath = '';
  let isIndex = false;
  let children: ParsedRoute[] = [];

  // TODO: extract `caseSensitive` when ParsedRoute supports it
  // TODO: note `errorElement` / `ErrorBoundary` as metadata (not a separate node)

  for (const prop of obj.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;

    switch (prop.key.name) {
      case 'path':
        if (t.isStringLiteral(prop.value)) {
          routePath = prop.value.value;
        }
        break;

      case 'index':
        if (t.isBooleanLiteral(prop.value) && prop.value.value) {
          isIndex = true;
        }
        break;

      case 'element': {
        const resolved = resolveElementComponent(prop.value, importMap);
        if (resolved) {
          componentName = resolved.name;
          componentFilePath = resolved.filePath;
        }
        break;
      }

      case 'Component': {
        if (t.isIdentifier(prop.value)) {
          const info = importMap.get(prop.value.name);
          componentName = prop.value.name;
          componentFilePath = info?.resolvedPath ?? '';
        }
        break;
      }

      case 'lazy': {
        const resolved = resolveLazyImport(prop.value, entryFile);
        if (resolved) {
          componentName = resolved.name;
          componentFilePath = resolved.filePath;
        }
        break;
      }

      case 'children':
        if (t.isArrayExpression(prop.value)) {
          const fullPath = buildFullPath(parentPath, routePath ?? '');
          children = parseRouteArray(prop.value, fullPath, importMap, entryFile);
        }
        break;
    }
  }

  const fullPath = isIndex
    ? parentPath || '/'
    : buildFullPath(parentPath, routePath ?? '');

  // GAP FIX #3 — Pathless layout routes:
  // A route with no `path` AND not an index route is still valid when it has
  // children (layout wrapper) or at least an element/Component.  Instead of
  // discarding it, keep it — using the parentPath as its resolved path and
  // marking isLayout.
  const isLayoutWrapper = !routePath && !isIndex && children.length > 0;

  if (!fullPath && !isIndex && !isLayoutWrapper) return null;

  return {
    path: fullPath || parentPath || '/',
    componentName,
    componentFilePath,
    // GAP FIX #2 — Splat routes: `*` anywhere in the path means dynamic
    // Also detect optional segments (:param?)
    isDynamic: fullPath.includes(':') || fullPath.includes('*'),
    isIndex,
    isLayout: isLayoutWrapper || children.length > 0,
    isOptionalCatchAll: fullPath.includes('?'),
    parentPath: parentPath || undefined,
    children: children.length > 0 ? children : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JSX-style route parsing  (<Routes><Route … /></Routes>)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse an array of JSX children, picking out <Route> elements.
 */
function parseJSXRouteChildren(
  children: (t.JSXElement | t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXFragment)[],
  parentPath: string,
  importMap: Map<string, { source: string; importedName: string; resolvedPath: string | null }>,
): ParsedRoute[] {
  const routes: ParsedRoute[] = [];

  for (const child of children) {
    if (!t.isJSXElement(child)) continue;
    if (!isJSXName(child.openingElement.name, 'Route')) continue;

    const route = parseJSXRouteElement(child, parentPath, importMap);
    if (route) routes.push(route);
  }

  return routes;
}

/**
 * Convert a single JSX <Route> element into a ParsedRoute.
 */
function parseJSXRouteElement(
  element: t.JSXElement,
  parentPath: string,
  importMap: Map<string, { source: string; importedName: string; resolvedPath: string | null }>,
): ParsedRoute | null {
  const attrs = element.openingElement.attributes;

  let routePath: string | null = null;
  let componentName = 'Unknown';
  let componentFilePath = '';
  let isIndex = false;

  // TODO: extract `caseSensitive` attribute when ParsedRoute supports it
  // TODO: note `errorElement` attribute as metadata (not a separate node)

  for (const attr of attrs) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) continue;

    const name = attr.name.name;

    if (name === 'path') {
      if (t.isStringLiteral(attr.value)) {
        routePath = attr.value.value;
      } else if (
        t.isJSXExpressionContainer(attr.value) &&
        t.isStringLiteral(attr.value.expression)
      ) {
        routePath = attr.value.expression.value;
      }
    }

    if (name === 'index') {
      // <Route index /> — attr.value is null for boolean-shorthand JSX attrs
      if (attr.value === null) {
        isIndex = true;
      } else if (
        t.isJSXExpressionContainer(attr.value) &&
        t.isBooleanLiteral(attr.value.expression) &&
        attr.value.expression.value
      ) {
        isIndex = true;
      }
    }

    if (name === 'element') {
      // element={<ComponentName />}
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isJSXElement(expr)) {
          const resolved = resolveElementComponent(expr, importMap);
          if (resolved) {
            componentName = resolved.name;
            componentFilePath = resolved.filePath;
          }
        }
      }
    }

    if (name === 'Component') {
      // Component={ComponentName}
      if (
        t.isJSXExpressionContainer(attr.value) &&
        t.isIdentifier(attr.value.expression)
      ) {
        const info = importMap.get(attr.value.expression.name);
        componentName = attr.value.expression.name;
        componentFilePath = info?.resolvedPath ?? '';
      }
    }
  }

  // Recurse into nested <Route> children
  const fullPath = isIndex
    ? parentPath || '/'
    : buildFullPath(parentPath, routePath ?? '');

  const children = parseJSXRouteChildren(element.children, fullPath, importMap);

  // GAP FIX #3 — Pathless layout routes (JSX variant)
  const isLayoutWrapper = !routePath && !isIndex && children.length > 0;

  if (!fullPath && !isIndex && !isLayoutWrapper) return null;

  return {
    path: fullPath || parentPath || '/',
    componentName,
    componentFilePath,
    isDynamic: fullPath.includes(':') || fullPath.includes('*'),
    isIndex,
    isLayout: isLayoutWrapper || children.length > 0,
    parentPath: parentPath || undefined,
    children: children.length > 0 ? children : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Shared helpers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Flatten a route tree into a flat array. Layout routes that have children
 * are included (they render UI too), plus all nested children.
 */
function flattenRoutes(routes: ParsedRoute[]): ParsedRoute[] {
  const flat: ParsedRoute[] = [];
  for (const route of routes) {
    flat.push(route);
    if (route.children) {
      flat.push(...flattenRoutes(route.children));
    }
  }
  return flat;
}

function buildFullPath(parentPath: string, childPath: string): string {
  if (childPath.startsWith('/')) return childPath;
  if (!childPath) return parentPath || '/';
  const parent = parentPath.endsWith('/') ? parentPath : parentPath + '/';
  const full = parent + childPath;
  return full.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/**
 * Check whether a JSXName node matches a given component name.
 * Handles JSXIdentifier and JSXMemberExpression (e.g. React.Fragment — though
 * unlikely for Route, we keep it defensive).
 */
function isJSXName(name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName, expected: string): boolean {
  if (t.isJSXIdentifier(name)) return name.name === expected;
  return false;
}

function resolveElementComponent(
  value: t.Node,
  importMap: Map<string, { source: string; importedName: string; resolvedPath: string | null }>,
): { name: string; filePath: string } | null {
  if (t.isJSXElement(value)) {
    const opening = value.openingElement;
    if (t.isJSXIdentifier(opening.name)) {
      const name = opening.name.name;
      const info = importMap.get(name);
      return { name, filePath: info?.resolvedPath ?? '' };
    }
  }
  return null;
}

function resolveLazyImport(
  value: t.Node,
  entryFile: string,
): { name: string; filePath: string } | null {
  if (t.isArrowFunctionExpression(value) || t.isFunctionExpression(value)) {
    const body = t.isBlockStatement(value.body) ? value.body.body[0] : value.body;

    let importCall: t.CallExpression | null = null;
    if (t.isCallExpression(body) && t.isImport(body.callee)) {
      importCall = body;
    } else if (
      t.isReturnStatement(body) &&
      t.isCallExpression(body.argument) &&
      t.isImport(body.argument.callee)
    ) {
      importCall = body.argument;
    }

    if (importCall && t.isStringLiteral(importCall.arguments[0])) {
      const importPath = importCall.arguments[0].value;
      const resolvedPath = resolveImport(importPath, entryFile);
      const name = importPath.split('/').pop()?.replace(/\.\w+$/, '') ?? 'Unknown';
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        filePath: resolvedPath ?? '',
      };
    }
  }
  return null;
}
