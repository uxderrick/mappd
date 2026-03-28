import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'TB';

const NODE_WIDTH = 480;
const DEFAULT_NODE_HEIGHT = 400;

export function layoutGraph<T extends Record<string, unknown> = Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  direction: LayoutDirection = 'LR',
  nodeHeight: number = DEFAULT_NODE_HEIGHT,
  nodeHeights?: Record<string, number>
): Node<T>[] {
  if (nodes.length === 0) return [];

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    const h = nodeHeights?.[node.id] ?? nodeHeight;
    g.setNode(node.id, { width: NODE_WIDTH, height: h });
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  try {
    dagre.layout(g);
  } catch {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    return nodes.map((node, i) => ({
      ...node,
      position: {
        x: (i % cols) * (NODE_WIDTH + 60),
        y: Math.floor(i / cols) * (nodeHeight + 60),
      },
    }));
  }

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const h = nodeHeights?.[node.id] ?? nodeHeight;
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - h / 2,
      },
    };
  });
}
