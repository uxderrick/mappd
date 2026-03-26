import fs from 'node:fs';
import path from 'node:path';
import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import { detectFramework } from './detect-framework.js';
import { extractReactRouterRoutes } from './extractors/react-router.js';
import { extractNextjsAppRoutes } from './extractors/nextjs-app-router.js';
import { extractNextjsPagesRoutes } from './extractors/nextjs-pages-router.js';
import { extractReactRouterV7Routes } from './extractors/react-router-v7.js';
import { detectLinks, parseRouteHelpers } from './analyzers/link-detector.js';
import { parseFile } from './analyzers/ast-utils.js';
import { buildFlowGraph } from './graph-builder.js';
import { layoutNodes } from './layout.js';
import type { FlowGraph, DetectedLink } from './types.js';

export type { FlowGraph, ScreenNode, FlowEdge } from './types.js';

export interface ParseOptions {
  devServerUrl?: string;
}

/**
 * Parse a project directory and return a FlowGraph.
 */
export function parseProject(projectDir: string, options?: ParseOptions): FlowGraph {
  const absDir = path.resolve(projectDir);
  const detection = detectFramework(absDir);

  // Read project name from package.json
  const pkgPath = path.join(absDir, 'package.json');
  const projectName = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).name ?? 'unknown'
    : 'unknown';

  // Try to parse a centralized routes file for helper resolution
  const routeHelpers = parseRouteHelpers(absDir);

  let graph: FlowGraph;

  switch (detection.framework) {
    case 'react-router': {
      const allRoutes = detection.entryPoints.flatMap((entry) =>
        extractReactRouterRoutes(entry)
      );
      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });
      graph = buildFlowGraph(allRoutes, allLinks, {
        projectName,
        framework: 'react-router',
      });
      break;
    }

    case 'react-router-v7': {
      const allRoutes = extractReactRouterV7Routes(detection.entryPoints, absDir);
      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });
      // Also scan route module files for loader/action redirect() calls
      const routeModuleFiles = allRoutes
        .filter((r) => r.componentFilePath)
        .map((r) => r.componentFilePath);
      for (const moduleFile of routeModuleFiles) {
        const route = allRoutes.find((r) => r.componentFilePath === moduleFile);
        if (!route) continue;
        // detectLinks already scans the component file, but we want to catch
        // redirect() in loader/action exports too — those are in the same file
        // so they're already picked up by the detectLinks call above.
      }
      graph = buildFlowGraph(allRoutes, allLinks, {
        projectName,
        framework: 'react-router-v7',
      });
      break;
    }

    case 'nextjs-app': {
      const nextConfig = parseNextConfig(absDir);

      const allRoutes = detection.entryPoints.flatMap((entry) =>
        extractNextjsAppRoutes(entry)
      );

      // Apply trailingSlash if configured
      if (nextConfig.trailingSlash) {
        for (const route of allRoutes) {
          route.path = normalizeTrailingSlash(route.path, true);
        }
      }

      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });

      // Scan route.ts/route.js files for redirect edges
      for (const entryPoint of detection.entryPoints) {
        const routeHandlerLinks = scanRouteHandlers(entryPoint, routeHelpers);
        allLinks.push(...routeHandlerLinks);
      }

      // Scan middleware.ts / proxy.ts for navigation edges
      const middlewareLinks = scanMiddlewareFiles(absDir, routeHelpers);
      allLinks.push(...middlewareLinks);

      // Scan Server Action files ('use server') for redirect() calls
      const serverActionLinks = scanServerActionFiles(absDir, routeHelpers);
      allLinks.push(...serverActionLinks);

      // Config redirects/rewrites
      allLinks.push(...nextConfig.links);
      applyBasePath(allLinks, nextConfig.basePath);

      graph = buildFlowGraph(allRoutes, allLinks, {
        projectName,
        framework: 'nextjs-app',
      });
      break;
    }

    case 'nextjs-pages': {
      const nextConfig = parseNextConfig(absDir);

      // Pass pageExtensions to the pages router extractor
      const pageExtensions = nextConfig.pageExtensions.length > 0
        ? nextConfig.pageExtensions
        : undefined;

      const allRoutes = detection.entryPoints.flatMap((entry) =>
        extractNextjsPagesRoutes(entry, pageExtensions)
      );

      // Apply trailingSlash if configured
      if (nextConfig.trailingSlash) {
        for (const route of allRoutes) {
          route.path = normalizeTrailingSlash(route.path, true);
        }
      }

      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });

      // Scan for getServerSideProps/getStaticProps redirects in page files
      const ssrRedirects = scanPagesRouterRedirects(allRoutes, routeHelpers);
      allLinks.push(...ssrRedirects);

      // Scan middleware.ts / proxy.ts for navigation edges
      const middlewareLinks = scanMiddlewareFiles(absDir, routeHelpers);
      allLinks.push(...middlewareLinks);

      // Scan Server Action files ('use server') for redirect() calls
      const serverActionLinks = scanServerActionFiles(absDir, routeHelpers);
      allLinks.push(...serverActionLinks);

      // Config redirects/rewrites
      allLinks.push(...nextConfig.links);
      applyBasePath(allLinks, nextConfig.basePath);

      graph = buildFlowGraph(allRoutes, allLinks, {
        projectName,
        framework: 'nextjs-pages',
      });
      break;
    }

    default:
      throw new Error(`Unsupported framework: ${detection.framework}`);
  }

  // Auto-layout
  layoutNodes(graph.nodes, graph.edges);

  return graph;
}

// ===== Gap 3: Scan route.ts files for redirect edges =====

const ROUTE_FILE_NAMES = ['route.ts', 'route.tsx', 'route.js', 'route.jsx'];

function scanRouteHandlers(
  appDir: string,
  routeHelpers?: Map<string, string>,
): DetectedLink[] {
  const links: DetectedLink[] = [];
  scanDirForRouteHandlers(appDir, '', appDir, links, routeHelpers);
  return links;
}

function scanDirForRouteHandlers(
  dir: string,
  routePath: string,
  appDir: string,
  links: DetectedLink[],
  routeHelpers?: Map<string, string>,
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const name of ROUTE_FILE_NAMES) {
    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath)) {
      const detected = detectLinks(filePath, routePath || '/', routeHelpers);
      links.push(...detected);
      break;
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue;

    let childPath = routePath;
    const dirName = entry.name;

    if (dirName.startsWith('(') && dirName.endsWith(')')) {
      // route group — no segment added
    } else if (dirName.startsWith('@')) {
      // parallel route slot — no segment added
    } else if (dirName.startsWith('[') && dirName.endsWith(']')) {
      childPath = `${routePath}/:${dirName.slice(1, -1)}`;
    } else {
      childPath = `${routePath}/${dirName}`;
    }

    scanDirForRouteHandlers(path.join(dir, dirName), childPath, appDir, links, routeHelpers);
  }
}

// ===== Gap 7: Scan middleware.ts / proxy.ts =====

function scanMiddlewareFiles(
  projectDir: string,
  routeHelpers?: Map<string, string>,
): DetectedLink[] {
  const links: DetectedLink[] = [];
  const names = ['middleware.ts', 'middleware.js', 'proxy.ts', 'proxy.js'];
  const dirs = [projectDir, path.join(projectDir, 'src')];

  for (const dir of dirs) {
    for (const name of names) {
      const filePath = path.join(dir, name);
      if (fs.existsSync(filePath)) {
        const detected = detectLinks(filePath, '/', routeHelpers);
        links.push(...detected);
      }
    }
  }

  return links;
}

// ===== Next.js config parsing =====

interface NextConfig {
  basePath: string;
  trailingSlash: boolean;
  pageExtensions: string[];
  links: DetectedLink[];
}

function parseNextConfig(projectDir: string): NextConfig {
  const candidates = [
    'next.config.ts',
    'next.config.mjs',
    'next.config.js',
  ];

  let configPath: string | null = null;
  for (const candidate of candidates) {
    const full = path.join(projectDir, candidate);
    if (fs.existsSync(full)) {
      configPath = full;
      break;
    }
  }

  const result: NextConfig = {
    basePath: '',
    trailingSlash: false,
    pageExtensions: [],
    links: [],
  };

  if (!configPath) return result;

  try {
    const ast = parseFile(configPath);

    traverse(ast, {
      ObjectProperty(nodePath: any) {
        const key = nodePath.node.key;
        const keyName = t.isIdentifier(key) ? key.name : t.isStringLiteral(key) ? key.value : null;
        if (!keyName) return;

        // basePath: '/docs'
        if (keyName === 'basePath' && t.isStringLiteral(nodePath.node.value)) {
          result.basePath = nodePath.node.value.value;
          return;
        }

        // trailingSlash: true
        if (keyName === 'trailingSlash' && t.isBooleanLiteral(nodePath.node.value)) {
          result.trailingSlash = nodePath.node.value.value;
          return;
        }

        // pageExtensions: ['page.tsx', 'page.ts']
        if (keyName === 'pageExtensions' && t.isArrayExpression(nodePath.node.value)) {
          result.pageExtensions = nodePath.node.value.elements
            .filter((e: any): e is t.StringLiteral => t.isStringLiteral(e))
            .map((e: t.StringLiteral) => e.value);
          return;
        }

        // redirects / rewrites
        if (keyName !== 'redirects' && keyName !== 'rewrites') return;

        const isRedirect = keyName === 'redirects';

        nodePath.traverse({
          ArrayExpression(arrPath: any) {
            for (const element of arrPath.node.elements) {
              if (!t.isObjectExpression(element)) continue;

              let source: string | null = null;
              let destination: string | null = null;

              for (const prop of element.properties) {
                if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;
                if (prop.key.name === 'source' && t.isStringLiteral(prop.value)) {
                  source = prop.value.value;
                }
                if (prop.key.name === 'destination' && t.isStringLiteral(prop.value)) {
                  destination = prop.value.value;
                }
              }

              if (source && destination && destination.startsWith('/')) {
                result.links.push({
                  sourceFilePath: configPath!,
                  sourceRoutePath: source,
                  sourceLine: element.loc?.start.line ?? 0,
                  sourceColumn: element.loc?.start.column ?? 0,
                  triggerType: 'programmatic',
                  targetPath: destination,
                  labelHint: `${isRedirect ? 'Config Redirect' : 'Config Rewrite'}: ${source} → ${destination}`,
                });
              }
            }
          },
        });
      },
    });
  } catch {
    // Config too complex to parse statically — skip gracefully
  }

  return result;
}

/**
 * Apply basePath prefix to all route paths if configured.
 */
function applyBasePath(links: DetectedLink[], basePath: string): void {
  if (!basePath) return;
  // basePath affects how routes are resolved but the parser's internal
  // route paths should NOT include basePath (it's a deployment concern).
  // However, config redirects may need basePath awareness.
  // For now we document this — the graph uses clean paths.
}

/**
 * Apply trailingSlash normalization to route paths.
 */
function normalizeTrailingSlash(routePath: string, trailingSlash: boolean): string {
  if (!trailingSlash) return routePath;
  if (routePath === '/') return routePath;
  return routePath.endsWith('/') ? routePath : routePath + '/';
}

/**
 * Parse a project and write the result to .mappd/flow-graph.json
 */
export function parseAndWrite(projectDir: string, options?: ParseOptions): FlowGraph {
  const graph = parseProject(projectDir, options);
  const outputDir = path.join(path.resolve(projectDir), '.mappd');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'flow-graph.json'),
    JSON.stringify(graph, null, 2),
    'utf-8'
  );

  return graph;
}
