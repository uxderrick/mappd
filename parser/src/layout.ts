import dagre from 'dagre';
import type { ScreenNode, FlowEdge } from './types.js';

const NODE_WIDTH = 480;
const NODE_HEIGHT = 400;

/**
 * Auto-position nodes using dagre directed graph layout.
 * Falls back to a grid layout if dagre fails.
 */
export function layoutNodes(nodes: ScreenNode[], edges: FlowEdge[]): void {
  try {
    dagreLayout(nodes, edges);
  } catch {
    // Dagre can crash on certain graph shapes (cycles, disconnected subgraphs)
    gridLayout(nodes);
  }
}

function dagreLayout(nodes: ScreenNode[], edges: FlowEdge[]): void {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'LR',
    nodesep: 100,
    ranksep: 200,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({ weight: 1 }));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const addedEdges = new Set<string>();
  for (const edge of edges) {
    if (edge.sourceNodeId === edge.targetNodeId) continue;
    if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) continue;
    const key = `${edge.sourceNodeId}->${edge.targetNodeId}`;
    if (addedEdges.has(key)) continue;
    addedEdges.add(key);
    g.setEdge(edge.sourceNodeId, edge.targetNodeId);
  }

  dagre.layout(g);

  for (const node of nodes) {
    const pos = g.node(node.id);
    if (pos) {
      node.position = {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      };
    }
  }
}

/**
 * Simple grid fallback: arrange nodes left-to-right, wrapping after 4 columns.
 */
function gridLayout(nodes: ScreenNode[]): void {
  const cols = 4;
  const gapX = NODE_WIDTH + 120;
  const gapY = NODE_HEIGHT + 80;

  for (let i = 0; i < nodes.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes[i].position = {
      x: 50 + col * gapX,
      y: 50 + row * gapY,
    };
  }
}
