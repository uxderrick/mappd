import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'TB';

const NODE_WIDTH = 480;
const DEFAULT_NODE_HEIGHT = 400;

export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'LR',
  nodeHeight: number = DEFAULT_NODE_HEIGHT
): Node[] {
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
    g.setNode(node.id, { width: NODE_WIDTH, height: nodeHeight });
  }

  // Only add edges where both source and target exist
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  try {
    dagre.layout(g);
  } catch {
    // Fallback: simple grid layout if dagre fails
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
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - nodeHeight / 2,
      },
    };
  });
}
