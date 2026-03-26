import fs from 'node:fs';
import path from 'node:path';
import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import { detectFramework } from './detect-framework.js';
import { extractReactRouterRoutes } from './extractors/react-router.js';
import { extractNextjsAppRoutes } from './extractors/nextjs-app-router.js';
import { extractNextjsPagesRoutes } from './extractors/nextjs-pages-router.js';
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

    case 'nextjs-app': {
      const allRoutes = detection.entryPoints.flatMap((entry) =>
        extractNextjsAppRoutes(entry)
      );
      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });

      // Gap 3: Scan route.ts/route.js files for redirect edges
      for (const entryPoint of detection.entryPoints) {
        const routeHandlerLinks = scanRouteHandlers(entryPoint, routeHelpers);
        allLinks.push(...routeHandlerLinks);
      }

      // Gap 7: Scan middleware.ts / proxy.ts for navigation edges
      const middlewareLinks = scanMiddlewareFiles(absDir, routeHelpers);
      allLinks.push(...middlewareLinks);

      // Gap 10: Parse next.config.js redirects/rewrites
      const configLinks = parseNextConfigRedirects(absDir);
      allLinks.push(...configLinks);

      graph = buildFlowGraph(allRoutes, allLinks, {
        projectName,
        framework: 'nextjs-app',
      });
      break;
    }

    case 'nextjs-pages': {
      const allRoutes = detection.entryPoints.flatMap((entry) =>
        extractNextjsPagesRoutes(entry)
      );
      const allLinks = allRoutes.flatMap((route) => {
        if (!route.componentFilePath) return [];
        return detectLinks(route.componentFilePath, route.path, routeHelpers);
      });

      // Gap 7: Scan middleware.ts / proxy.ts for navigation edges
      const middlewareLinks = scanMiddlewareFiles(absDir, routeHelpers);
      allLinks.push(...middlewareLinks);

      // Gap 10: Parse next.config.js redirects/rewrites
      const configLinks = parseNextConfigRedirects(absDir);
      allLinks.push(...configLinks);

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

// ===== Gap 10: Parse next.config.js redirects/rewrites =====

function parseNextConfigRedirects(projectDir: string): DetectedLink[] {
  const candidates = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
  ];

  let configPath: string | null = null;
  for (const candidate of candidates) {
    const full = path.join(projectDir, candidate);
    if (fs.existsSync(full)) {
      configPath = full;
      break;
    }
  }

  if (!configPath) return [];

  const links: DetectedLink[] = [];

  try {
    const ast = parseFile(configPath);

    traverse(ast, {
      ObjectProperty(nodePath: any) {
        const key = nodePath.node.key;
        const keyName = t.isIdentifier(key) ? key.name : t.isStringLiteral(key) ? key.value : null;
        if (keyName !== 'redirects' && keyName !== 'rewrites') return;

        const isRedirect = keyName === 'redirects';

        // The value is typically an async function that returns an array.
        // We look for ReturnStatement containing an ArrayExpression inside.
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
                links.push({
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

  return links;
}

/**
 * Parse a project and write the result to .flowcanvas/flow-graph.json
 */
export function parseAndWrite(projectDir: string, options?: ParseOptions): FlowGraph {
  const graph = parseProject(projectDir, options);
  const outputDir = path.join(path.resolve(projectDir), '.flowcanvas');

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
