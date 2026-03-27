import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'TB';

const NODE_WIDTH = 480;
const NODE_HEIGHT = 400;

export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'LR'
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}
