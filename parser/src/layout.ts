import dagre from 'dagre';
import type { ScreenNode, FlowEdge } from './types.js';

const NODE_WIDTH = 480;
const NODE_HEIGHT = 400;
const SECTION_GAP = 120; // extra vertical gap between route sections

/**
 * Auto-position nodes using section grouping + route depth.
 *
 * Strategy:
 * 1. Group routes by their top-level section (e.g., /dashboard/*, /settings/*)
 * 2. Within each group, use Dagre for directed layout (L→R by depth)
 * 3. Stack groups vertically with clear separation
 *
 * Falls back to a simple grid if Dagre fails.
 */
export function layoutNodes(nodes: ScreenNode[], edges: FlowEdge[]): void {
  if (nodes.length === 0) return;

  try {
    sectionLayout(nodes, edges);
  } catch {
    gridLayout(nodes);
  }
}

/**
 * Group by route section, then Dagre within each group.
 */
function sectionLayout(nodes: ScreenNode[], edges: FlowEdge[]): void {
  // Step 1: Group nodes by top-level section
  const groups = groupBySection(nodes);
  const sectionOrder = orderSections(groups, edges);

  // Step 2: Layout each section independently with Dagre
  const nodeIds = new Set(nodes.map((n) => n.id));
  let currentY = 50;

  for (const sectionName of sectionOrder) {
    const sectionNodes = groups.get(sectionName);
    if (!sectionNodes || sectionNodes.length === 0) continue;

    // Find edges that connect nodes within this section
    const sectionNodeIds = new Set(sectionNodes.map((n) => n.id));
    const sectionEdges = edges.filter(
      (e) =>
        sectionNodeIds.has(e.sourceNodeId) && sectionNodeIds.has(e.targetNodeId) &&
        e.sourceNodeId !== e.targetNodeId
    );

    // Also include edges FROM other sections TO this section (for rank ordering)
    const inboundEdges = edges.filter(
      (e) =>
        !sectionNodeIds.has(e.sourceNodeId) && sectionNodeIds.has(e.targetNodeId) &&
        nodeIds.has(e.sourceNodeId)
    );

    // Layout this section
    const sectionHeight = layoutSection(sectionNodes, sectionEdges, currentY);
    currentY += sectionHeight + SECTION_GAP;
  }
}

/**
 * Group nodes by their top-level route section.
 * / → "root"
 * /login, /register → "auth"
 * /dashboard, /dashboard/settings → "dashboard"
 * /settings, /settings/team → "settings"
 */
function groupBySection(nodes: ScreenNode[]): Map<string, ScreenNode[]> {
  const groups = new Map<string, ScreenNode[]>();

  for (const node of nodes) {
    const section = getSection(node.routePath);
    if (!groups.has(section)) {
      groups.set(section, []);
    }
    groups.get(section)!.push(node);
  }

  return groups;
}

/**
 * Extract the section name from a route path.
 */
function getSection(routePath: string): string {
  if (routePath === '/' || routePath === '') return 'root';
  if (routePath === '/*') return 'other';

  const segments = routePath.split('/').filter(Boolean);
  const first = segments[0];

  // Auth-related routes get grouped
  const authRoutes = ['login', 'register', 'signup', 'forgot-password', 'reset-password', 'verify', 'onboarding'];
  if (authRoutes.includes(first)) return 'auth';

  return first;
}

/**
 * Order sections so the flow reads naturally:
 * 1. "root" (landing/home) first
 * 2. "auth" (login/register) second
 * 3. Everything else alphabetically
 * 4. "other" (catch-all/*) last
 */
function orderSections(
  groups: Map<string, ScreenNode[]>,
  edges: FlowEdge[],
): string[] {
  const sections = Array.from(groups.keys());

  return sections.sort((a, b) => {
    if (a === 'root') return -1;
    if (b === 'root') return 1;
    if (a === 'auth') return -1;
    if (b === 'auth') return 1;
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return a.localeCompare(b);
  });
}

/**
 * Layout a single section's nodes using Dagre.
 * Returns the total height used by this section.
 */
function layoutSection(
  nodes: ScreenNode[],
  edges: FlowEdge[],
  startY: number,
): number {
  if (nodes.length === 1) {
    // Single node — just place it
    nodes[0].position = { x: 50, y: startY };
    return NODE_HEIGHT;
  }

  // Sort nodes by depth for consistent Dagre ranking
  nodes.sort((a, b) => {
    const depthA = a.routePath.split('/').filter(Boolean).length;
    const depthB = b.routePath.split('/').filter(Boolean).length;
    return depthA - depthB;
  });

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 150,
    marginx: 50,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({ weight: 1 }));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges within the section
  const addedEdges = new Set<string>();
  for (const edge of edges) {
    const key = `${edge.sourceNodeId}->${edge.targetNodeId}`;
    if (addedEdges.has(key)) continue;
    addedEdges.add(key);
    g.setEdge(edge.sourceNodeId, edge.targetNodeId);
  }

  // If no edges, create implicit edges based on route depth
  // This ensures parent routes are to the left of child routes
  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      // Connect if b is a child of a (a's path is a prefix of b's path)
      if (b.routePath.startsWith(a.routePath) && b.routePath !== a.routePath) {
        g.setEdge(a.id, b.id);
      }
    }
  }

  dagre.layout(g);

  // Apply positions, offset by startY
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const pos = g.node(node.id);
    if (pos) {
      const y = pos.y - NODE_HEIGHT / 2;
      if (y < minY) minY = y;
      if (y + NODE_HEIGHT > maxY) maxY = y + NODE_HEIGHT;
    }
  }

  // Normalize: shift all nodes so the section starts at startY
  const yOffset = startY - minY;
  for (const node of nodes) {
    const pos = g.node(node.id);
    if (pos) {
      node.position = {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2 + yOffset,
      };
    }
  }

  return maxY - minY;
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
