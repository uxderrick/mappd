import { routePathToId } from './analyzers/ast-utils.js';
import type { ParsedRoute, DetectedLink, FlowGraph, ScreenNode, FlowEdge } from './types.js';

/**
 * Build a FlowGraph from parsed routes and detected links.
 */
export function buildFlowGraph(
  routes: ParsedRoute[],
  links: DetectedLink[],
  metadata: { projectName: string; framework: FlowGraph['metadata']['framework'] },
): FlowGraph {
  // Build nodes
  const nodes: ScreenNode[] = routes.map((route) => ({
    id: routePathToId(route.path),
    routePath: route.path,
    componentName: route.componentName,
    componentFilePath: route.componentFilePath,
    isIndex: route.isIndex,
    isDynamic: route.isDynamic,
    parentLayoutId: route.parentPath ? routePathToId(route.parentPath) : undefined,
    position: { x: 0, y: 0 }, // Will be set by layout
  }));

  // Build a set of valid node route paths for matching
  const routePaths = new Set(nodes.map((n) => n.routePath));
  const nodeByPath = new Map(nodes.map((n) => [n.routePath, n]));

  // Build edges
  const edgeSet = new Set<string>();
  const edges: FlowEdge[] = [];

  for (const link of links) {
    const sourceNode = nodeByPath.get(link.sourceRoutePath);
    if (!sourceNode) continue;

    // Find target node — exact match first, then pattern match
    let targetNode = nodeByPath.get(link.targetPath);
    if (!targetNode) {
      targetNode = findDynamicMatch(link.targetPath, nodes);
    }
    if (!targetNode) continue;

    // Skip self-links
    if (sourceNode.id === targetNode.id) continue;

    // Deduplicate
    const edgeKey = `${sourceNode.id}->${targetNode.id}:${link.triggerType}`;
    if (edgeSet.has(edgeKey)) continue;
    edgeSet.add(edgeKey);

    edges.push({
      id: `${sourceNode.id}-${targetNode.id}`,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      triggerType: link.triggerType,
      triggerLabel: link.labelHint,
      sourceCodeLocation: {
        file: link.sourceFilePath,
        line: link.sourceLine,
        column: link.sourceColumn,
      },
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      projectName: metadata.projectName,
      framework: metadata.framework,
      generatedAt: new Date().toISOString(),
      mappdVersion: '0.1.0',
    },
  };
}

/**
 * Match a concrete path like /dashboard/users/1 against dynamic route patterns.
 */
function findDynamicMatch(concretePath: string, nodes: ScreenNode[]): ScreenNode | undefined {
  const parts = concretePath.split('/');

  return nodes.find((node) => {
    const patternParts = node.routePath.split('/');
    if (parts.length !== patternParts.length) return false;
    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true;
      return part === parts[i];
    });
  });
}
