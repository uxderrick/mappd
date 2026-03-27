import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import fs from 'node:fs';
import path from 'node:path';
import { parseFile } from './ast-utils.js';
import type { DetectedLink } from '../types.js';

/**
 * Scan a component file for navigation calls and return detected links.
 * Optionally accepts a routeHelpers map resolved from a centralized routes file.
 *
 * Supports both absolute paths ('/dashboard') and relative paths ('../settings', './edit', '..').
 * Relative paths are resolved against the source route's position in the route tree.
 */
export function detectLinks(
  filePath: string,
  routePath: string,
  routeHelpers?: Map<string, string>,
): DetectedLink[] {
  const ast = parseFile(filePath);
  const links: DetectedLink[] = [];

  // Track identifiers that are navigation functions
  const navigateVars = new Set<string>();
  // Track identifiers that are router objects (from useRouter())
  const routerVars = new Set<string>();
  // Track identifiers that are submit functions (from useSubmit())
  const submitVars = new Set<string>();
  // Track identifiers that are fetcher objects (from useFetcher())
  const fetcherVars = new Set<string>();

  traverse(ast, {
    // Detect: const navigate = useNavigate() / useMappdNavigate()
    // Detect: const router = useRouter()
    // Detect: const submit = useSubmit()
    // Detect: const fetcher = useFetcher()
    VariableDeclarator(nodePath) {
      if (!t.isIdentifier(nodePath.node.id)) return;
      const init = nodePath.node.init;
      if (!t.isCallExpression(init) || !t.isIdentifier(init.callee)) return;

      const calleeName = init.callee.name;
      if (calleeName.toLowerCase().includes('navigate')) {
        navigateVars.add(nodePath.node.id.name);
      }
      if (calleeName === 'useRouter') {
        routerVars.add(nodePath.node.id.name);
      }
      if (calleeName === 'useSubmit') {
        submitVars.add(nodePath.node.id.name);
      }
      if (calleeName === 'useFetcher') {
        fetcherVars.add(nodePath.node.id.name);
      }
    },

    // Detect: <Link to="..."> / <NavLink to="..."> / <Link href="..."> / <a href="...">
    // Detect: <Navigate to="..." /> (declarative redirect)
    // Detect: <Form action="..." /> (form navigation)
    JSXOpeningElement(nodePath) {
      const name = nodePath.node.name;

      // Handle JSXMemberExpression: <fetcher.Form action="...">
      if (t.isJSXMemberExpression(name)) {
        if (
          t.isJSXIdentifier(name.object) &&
          fetcherVars.has(name.object.name) &&
          t.isJSXIdentifier(name.property) &&
          name.property.name === 'Form'
        ) {
          const actionAttr = nodePath.node.attributes.find(
            (a): a is t.JSXAttribute =>
              t.isJSXAttribute(a) &&
              t.isJSXIdentifier(a.name) &&
              a.name.name === 'action',
          );
          if (actionAttr) {
            const targetPath = extractValueFromAttr(actionAttr.value, routeHelpers);
            if (targetPath && targetPath.startsWith('/')) {
              links.push({
                sourceFilePath: filePath,
                sourceRoutePath: routePath,
                sourceLine: nodePath.node.loc?.start.line ?? 0,
                sourceColumn: nodePath.node.loc?.start.column ?? 0,
                triggerType: 'programmatic',
                targetPath,
                labelHint: `Fetcher Form: ${targetPath}`,
              });
            }
          }
        }
        return;
      }

      if (!t.isJSXIdentifier(name)) return;

      // --- <Navigate to="..." /> ---
      if (name.name === 'Navigate') {
        const toAttr = nodePath.node.attributes.find(
          (a): a is t.JSXAttribute =>
            t.isJSXAttribute(a) &&
            t.isJSXIdentifier(a.name) &&
            a.name.name === 'to',
        );
        if (!toAttr) return;

        const rawTarget = extractValueFromAttr(toAttr.value, routeHelpers);
        const targetPath = normalizePath(rawTarget, routePath);
        if (!targetPath) return;

        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath,
          labelHint: `Redirect: ${targetPath}`,
        });
        return;
      }

      // --- fetcher.Form / Form action="..." ---
      if (name.name === 'Form') {
        // Skip fetcher forms (navigate={false})
        const navigateFalseAttr = nodePath.node.attributes.find(
          (a): a is t.JSXAttribute =>
            t.isJSXAttribute(a) &&
            t.isJSXIdentifier(a.name) &&
            a.name.name === 'navigate' &&
            t.isJSXExpressionContainer(a.value) &&
            t.isBooleanLiteral(a.value.expression) &&
            a.value.expression.value === false,
        );
        if (navigateFalseAttr) return;

        const actionAttr = nodePath.node.attributes.find(
          (a): a is t.JSXAttribute =>
            t.isJSXAttribute(a) &&
            t.isJSXIdentifier(a.name) &&
            a.name.name === 'action',
        );
        if (!actionAttr) return;

        const rawFormTarget = extractValueFromAttr(actionAttr.value, routeHelpers);
        const formTargetPath = normalizePath(rawFormTarget, routePath);
        if (!formTargetPath) return;

        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath: formTargetPath,
          labelHint: `Form: ${formTargetPath}`,
        });
        return;
      }

      // --- <Link>, <NavLink>, <a> ---
      let attrNames: string[] = [];
      if (name.name === 'Link' || name.name === 'NavLink') {
        attrNames = ['to', 'href'];
      } else if (name.name === 'a') {
        attrNames = ['href'];
      }
      if (attrNames.length === 0) return;

      const attr = nodePath.node.attributes.find(
        (a): a is t.JSXAttribute =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          attrNames.includes(a.name.name),
      );
      if (!attr) return;

      const rawLinkTarget = extractValueFromAttr(attr.value, routeHelpers);
      const targetPath = normalizePath(rawLinkTarget, routePath);
      if (!targetPath) return;

      const parent = nodePath.parentPath;
      let labelHint = `Link: ${targetPath}`;
      if (parent && t.isJSXElement(parent.node)) {
        const textChild = extractJSXText(parent.node);
        if (textChild) labelHint = `Click: ${textChild}`;
      }

      links.push({
        sourceFilePath: filePath,
        sourceRoutePath: routePath,
        sourceLine: nodePath.node.loc?.start.line ?? 0,
        sourceColumn: nodePath.node.loc?.start.column ?? 0,
        triggerType: 'link',
        targetPath,
        labelHint,
      });
    },

    // Detect: navigate('/path') / router.push('/path') / router.replace('/path')
    // Detect: redirect('/path') / permanentRedirect('/path') / redirectDocument('/path')
    // Detect: replace('/path') (standalone utility)
    // Detect: submit(data, { action: '/path' })
    // Detect: router.prefetch('/path')
    // Detect: window.history.pushState / window.history.replaceState
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;

      // --- submit(data, { action: '/path' }) ---
      if (t.isIdentifier(callee) && submitVars.has(callee.name)) {
        const secondArg = nodePath.node.arguments[1];
        if (secondArg && t.isObjectExpression(secondArg)) {
          const actionProp = secondArg.properties.find(
            (p): p is t.ObjectProperty =>
              t.isObjectProperty(p) &&
              t.isIdentifier(p.key) &&
              p.key.name === 'action',
          );
          if (actionProp) {
            const rawTarget = extractPathFromNode(actionProp.value, routeHelpers);
            const resolved = normalizePath(rawTarget, routePath);
            if (resolved) {
              links.push({
                sourceFilePath: filePath,
                sourceRoutePath: routePath,
                sourceLine: nodePath.node.loc?.start.line ?? 0,
                sourceColumn: nodePath.node.loc?.start.column ?? 0,
                triggerType: 'programmatic',
                targetPath: resolved,
                labelHint: `Submit: ${resolved}`,
              });
            }
          }
        }
        return;
      }

      // --- redirect() / permanentRedirect() / redirectDocument() / replace() ---
      const redirectIdentifiers = new Set([
        'redirect',
        'permanentRedirect',
        'redirectDocument',
      ]);
      if (t.isIdentifier(callee) && redirectIdentifiers.has(callee.name)) {
        if (nodePath.node.arguments.length === 0) return;
        const firstArg = nodePath.node.arguments[0];
        const rawTarget = extractPathFromNode(firstArg, routeHelpers);
        const resolved = normalizePath(rawTarget, routePath);
        if (!resolved) return;

        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath: resolved,
          labelHint: `Redirect: ${resolved}`,
        });
        return;
      }

      // --- window.history.pushState() / window.history.replaceState() ---
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        (callee.property.name === 'pushState' || callee.property.name === 'replaceState') &&
        t.isMemberExpression(callee.object) &&
        t.isIdentifier(callee.object.object) &&
        callee.object.object.name === 'window' &&
        t.isIdentifier(callee.object.property) &&
        callee.object.property.name === 'history'
      ) {
        const thirdArg = nodePath.node.arguments[2];
        if (thirdArg) {
          const rawTarget = extractPathFromNode(thirdArg, routeHelpers);
          const resolved = normalizePath(rawTarget, routePath);
          if (resolved) {
            links.push({
              sourceFilePath: filePath,
              sourceRoutePath: routePath,
              sourceLine: nodePath.node.loc?.start.line ?? 0,
              sourceColumn: nodePath.node.loc?.start.column ?? 0,
              triggerType: 'programmatic',
              targetPath: resolved,
              labelHint: `Navigate: ${resolved}`,
            });
          }
        }
        return;
      }

      // --- router.prefetch('/path') ---
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        routerVars.has(callee.object.name) &&
        t.isIdentifier(callee.property) &&
        callee.property.name === 'prefetch'
      ) {
        if (nodePath.node.arguments.length === 0) return;
        const firstArg = nodePath.node.arguments[0];
        const rawTarget = extractPathFromNode(firstArg, routeHelpers);
        const resolved = normalizePath(rawTarget, routePath);
        if (!resolved) return;

        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'link',
          targetPath: resolved,
          labelHint: `Prefetch: ${resolved}`,
        });
        return;
      }

      // --- fetcher.load('/path') ---
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        fetcherVars.has(callee.object.name) &&
        t.isIdentifier(callee.property) &&
        callee.property.name === 'load'
      ) {
        const firstArg = nodePath.node.arguments[0];
        const rawTarget = extractPathFromNode(firstArg, routeHelpers);
        const resolved = normalizePath(rawTarget, routePath);
        if (resolved) {
          links.push({
            sourceFilePath: filePath,
            sourceRoutePath: routePath,
            sourceLine: nodePath.node.loc?.start.line ?? 0,
            sourceColumn: nodePath.node.loc?.start.column ?? 0,
            triggerType: 'programmatic',
            targetPath: resolved,
            labelHint: `Fetcher: ${resolved}`,
          });
        }
        return;
      }

      // --- fetcher.submit(data, { action: '/path' }) ---
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        fetcherVars.has(callee.object.name) &&
        t.isIdentifier(callee.property) &&
        callee.property.name === 'submit'
      ) {
        if (nodePath.node.arguments.length >= 2) {
          const opts = nodePath.node.arguments[1];
          if (t.isObjectExpression(opts)) {
            for (const prop of opts.properties) {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'action') {
                const rawTarget = extractPathFromNode(prop.value, routeHelpers);
                const resolved = normalizePath(rawTarget, routePath);
                if (resolved) {
                  links.push({
                    sourceFilePath: filePath,
                    sourceRoutePath: routePath,
                    sourceLine: nodePath.node.loc?.start.line ?? 0,
                    sourceColumn: nodePath.node.loc?.start.column ?? 0,
                    triggerType: 'programmatic',
                    targetPath: resolved,
                    labelHint: `Fetcher: ${resolved}`,
                  });
                }
              }
            }
          }
        }
        return;
      }

      // --- NextResponse.redirect() / NextResponse.rewrite() ---
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        callee.object.name === 'NextResponse' &&
        t.isIdentifier(callee.property) &&
        (callee.property.name === 'redirect' || callee.property.name === 'rewrite')
      ) {
        const firstArg = nodePath.node.arguments[0];
        let rawTarget: string | null = null;

        rawTarget = extractPathFromNode(firstArg, routeHelpers);

        // new URL('/path', request.url) pattern
        if (!rawTarget && t.isNewExpression(firstArg) && t.isIdentifier(firstArg.callee) && firstArg.callee.name === 'URL') {
          const urlArg = firstArg.arguments[0];
          rawTarget = extractPathFromNode(urlArg, routeHelpers);
        }

        const resolved = normalizePath(rawTarget, routePath);
        if (resolved) {
          links.push({
            sourceFilePath: filePath,
            sourceRoutePath: routePath,
            sourceLine: nodePath.node.loc?.start.line ?? 0,
            sourceColumn: nodePath.node.loc?.start.column ?? 0,
            triggerType: 'programmatic',
            targetPath: resolved,
            labelHint: `${callee.property.name === 'redirect' ? 'Redirect' : 'Rewrite'}: ${resolved}`,
          });
        }
        return;
      }

      // --- notFound() / forbidden() / unauthorized() — trigger boundary UIs ---
      if (t.isIdentifier(callee) && callee.name === 'notFound') {
        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath: '/not-found',
          labelHint: 'Not Found',
        });
        return;
      }

      if (t.isIdentifier(callee) && callee.name === 'forbidden') {
        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath: '/forbidden',
          labelHint: 'Forbidden',
        });
        return;
      }

      if (t.isIdentifier(callee) && callee.name === 'unauthorized') {
        links.push({
          sourceFilePath: filePath,
          sourceRoutePath: routePath,
          sourceLine: nodePath.node.loc?.start.line ?? 0,
          sourceColumn: nodePath.node.loc?.start.column ?? 0,
          triggerType: 'programmatic',
          targetPath: '/unauthorized',
          labelHint: 'Unauthorized',
        });
        return;
      }

      // --- navigate('/path') / router.push/replace('/path') ---
      let isNav = false;

      if (t.isIdentifier(callee) && navigateVars.has(callee.name)) {
        isNav = true;
      }

      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        routerVars.has(callee.object.name) &&
        t.isIdentifier(callee.property) &&
        (callee.property.name === 'push' || callee.property.name === 'replace')
      ) {
        isNav = true;
      }

      // Fallback: catch any *.push() (covers untracked router vars)
      // But NOT *.replace() — too many false positives (String.replace, Array.replace, etc.)
      if (
        !isNav &&
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        callee.property.name === 'push'
      ) {
        isNav = true;
      }

      if (!isNav || nodePath.node.arguments.length === 0) return;

      const firstArg = nodePath.node.arguments[0];
      const rawTarget = extractPathFromNode(firstArg, routeHelpers);
      const resolvedNav = normalizePath(rawTarget, routePath);
      if (!resolvedNav) return;

      links.push({
        sourceFilePath: filePath,
        sourceRoutePath: routePath,
        sourceLine: nodePath.node.loc?.start.line ?? 0,
        sourceColumn: nodePath.node.loc?.start.column ?? 0,
        triggerType: 'programmatic',
        targetPath: resolvedNav,
        labelHint: `Navigate: ${resolvedNav}`,
      });
    },

    // --- Gap 2 (continued): throw redirect('/path') ---
    // ThrowStatement wrapping a redirect call is handled automatically because
    // the CallExpression visitor fires on the redirect() call inside the throw.
    // No additional visitor needed.
  });

  return links;
}

/**
 * Parse a centralized routes file (like routes.ts) and build a map of
 * member expression paths to route strings.
 *
 * e.g., routes.transactions.index → "/transactions"
 *       routes.transactions.detail → "/transactions/:id"
 */
export function parseRouteHelpers(projectDir: string): Map<string, string> | undefined {
  const candidates = [
    'src/routes.ts', 'src/routes.tsx', 'src/routes.js',
    'lib/routes.ts', 'lib/routes.tsx', 'lib/routes.js',
    'utils/routes.ts', 'utils/routes.tsx', 'utils/routes.js',
    'src/lib/routes.ts', 'src/lib/routes.tsx',
    'src/utils/routes.ts', 'src/utils/routes.tsx',
    'config/routes.ts', 'src/config/routes.ts',
  ];

  let routesFile: string | null = null;
  for (const candidate of candidates) {
    const full = path.join(projectDir, candidate);
    if (fs.existsSync(full)) {
      routesFile = full;
      break;
    }
  }

  if (!routesFile) return undefined;

  const ast = parseFile(routesFile);
  const helpers = new Map<string, string>();

  traverse(ast, {
    // Find: export const routes = { ... }
    VariableDeclarator(nodePath) {
      if (!t.isIdentifier(nodePath.node.id)) return;
      const varName = nodePath.node.id.name;
      if (varName !== 'routes' && varName !== 'ROUTES') return;
      if (!t.isObjectExpression(nodePath.node.init)) return;

      extractRoutesObject(nodePath.node.init, varName, helpers);
    },
  });

  return helpers.size > 0 ? helpers : undefined;
}

/**
 * Recursively extract route paths from a routes config object.
 */
function extractRoutesObject(
  obj: t.ObjectExpression,
  prefix: string,
  helpers: Map<string, string>,
) {
  for (const prop of obj.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;
    const key = `${prefix}.${prop.key.name}`;

    // String literal: routes.dashboard.index = '/'
    if (t.isStringLiteral(prop.value)) {
      helpers.set(key, prop.value.value);
    }
    // Arrow function: routes.transactions.detail = (id) => `/transactions/${id}`
    else if (t.isArrowFunctionExpression(prop.value)) {
      const body = prop.value.body;
      const resolved = extractPathFromNode(body, undefined);
      if (resolved) {
        helpers.set(key, resolved);
      }
    }
    // Nested object: routes.transactions = { index: '...', detail: ... }
    else if (t.isObjectExpression(prop.value)) {
      extractRoutesObject(prop.value, key, helpers);
    }
  }
}

// ===== Value extractors =====

function extractValueFromAttr(
  value: t.JSXAttribute['value'],
  routeHelpers?: Map<string, string>,
): string | null {
  if (t.isStringLiteral(value)) return value.value;
  if (t.isJSXExpressionContainer(value)) {
    return extractPathFromNode(value.expression, routeHelpers);
  }
  return null;
}

/**
 * Extract a path string from an AST node.
 * Handles: string literals, template literals, route helper calls, member expressions.
 */
function extractPathFromNode(
  node: t.Node,
  routeHelpers?: Map<string, string>,
): string | null {
  if (t.isStringLiteral(node)) return node.value;

  // Template literal: `/users/${id}` → "/users/:id"
  if (t.isTemplateLiteral(node)) {
    const parts: string[] = [];
    for (let i = 0; i < node.quasis.length; i++) {
      parts.push(node.quasis[i].value.cooked ?? node.quasis[i].value.raw);
      if (i < node.expressions.length) {
        parts.push(':param');
      }
    }
    const result = parts.join('');
    return result.replace(/:param$/, ':id').replace(/:param/g, ':id');
  }

  // Route helper call: routes.transactions.detail(id)
  if (t.isCallExpression(node) && routeHelpers) {
    const memberPath = memberExpressionToString(node.callee);
    if (memberPath) {
      const resolved = routeHelpers.get(memberPath);
      if (resolved) return resolved;
    }
  }

  // Member expression: routes.transactions.index or item.path
  if (t.isMemberExpression(node) && routeHelpers) {
    const memberPath = memberExpressionToString(node);
    if (memberPath) {
      const resolved = routeHelpers.get(memberPath);
      if (resolved) return resolved;
    }
  }

  // Object form: { pathname: '/about', query: {...} } or { pathname: '/users', search: '?q=test' }
  // Also handles Next.js Link: { pathname: '/blog/[slug]', query: { slug: 'hello' } }
  if (t.isObjectExpression(node)) {
    for (const prop of node.properties) {
      if (
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key) &&
        prop.key.name === 'pathname'
      ) {
        if (t.isStringLiteral(prop.value)) {
          return prop.value.value;
        }
        // pathname could be a template literal
        if (t.isTemplateLiteral(prop.value)) {
          return extractPathFromNode(prop.value, routeHelpers);
        }
      }
      // Also check 'to' property (React Router object form)
      if (
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key) &&
        prop.key.name === 'to' &&
        t.isStringLiteral(prop.value)
      ) {
        return prop.value.value;
      }
    }
  }

  return null;
}

/**
 * Convert a member expression AST node to a dotted string.
 * e.g., routes.transactions.detail → "routes.transactions.detail"
 */
function memberExpressionToString(node: t.Node): string | null {
  if (t.isIdentifier(node)) return node.name;
  if (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.property) &&
    !node.computed
  ) {
    const obj = memberExpressionToString(node.object);
    if (obj) return `${obj}.${node.property.name}`;
  }
  return null;
}

/**
 * Resolve a relative path against a source route path.
 * Examples:
 *   resolveRelativePath('/dashboard/users', '../settings') → '/dashboard/settings'
 *   resolveRelativePath('/dashboard/users', './edit')      → '/dashboard/users/edit'
 *   resolveRelativePath('/dashboard/users', '..')           → '/dashboard'
 *   resolveRelativePath('/dashboard/users', '.')            → '/dashboard/users'
 */
function resolveRelativePath(sourceRoutePath: string, relativePath: string): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith('/')) return relativePath;

  // Only resolve paths that look relative (., .., or start with ./ or ../)
  if (!relativePath.startsWith('.')) return null;

  const sourceParts = sourceRoutePath.split('/').filter(Boolean);
  const relParts = relativePath.split('/');

  // Start from the source path
  const resolved = [...sourceParts];

  for (const part of relParts) {
    if (part === '.') {
      // Current directory — no change
      continue;
    } else if (part === '..') {
      // Go up one level
      if (resolved.length > 0) {
        resolved.pop();
      }
    } else {
      // Add the segment
      resolved.push(part);
    }
  }

  return '/' + resolved.join('/');
}

/**
 * Normalize a detected path — if absolute return as-is, if relative resolve against source route.
 * Returns null if the path can't be resolved or is not a route path.
 */
function normalizePath(
  detectedPath: string | null,
  sourceRoutePath: string,
): string | null {
  if (!detectedPath) return null;

  // Absolute paths
  if (detectedPath.startsWith('/')) return detectedPath;

  // Relative paths (., .., ./, ../)
  if (detectedPath.startsWith('.')) {
    return resolveRelativePath(sourceRoutePath, detectedPath);
  }

  // Bare segments like 'edit' — treat as relative to current route
  // but only if they look like valid route segments (no spaces, no special chars)
  if (
    !detectedPath.includes(':') &&
    !detectedPath.includes('#') &&
    !detectedPath.includes('?') &&
    !detectedPath.includes('//') &&
    !detectedPath.includes(' ') &&
    /^[a-zA-Z0-9_\-$][a-zA-Z0-9_\-$/]*$/.test(detectedPath)
  ) {
    return resolveRelativePath(sourceRoutePath, './' + detectedPath);
  }

  return null;
}

function extractJSXText(element: t.JSXElement): string | null {
  const texts: string[] = [];
  for (const child of element.children) {
    if (t.isJSXText(child)) {
      const trimmed = child.value.trim();
      if (trimmed) texts.push(trimmed);
    }
    if (t.isJSXExpressionContainer(child) && t.isStringLiteral(child.expression)) {
      texts.push(child.expression.value);
    }
  }
  return texts.length > 0 ? texts.join(' ') : null;
}
