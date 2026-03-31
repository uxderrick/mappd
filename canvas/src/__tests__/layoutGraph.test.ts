import { describe, it, expect } from 'vitest';
import { layoutGraph } from '../lib/layoutGraph';
import type { Node, Edge } from '@xyflow/react';

function makeNode(id: string): Node<Record<string, unknown>> {
  return { id, position: { x: 0, y: 0 }, data: {} };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target };
}

describe('layoutGraph', () => {
  it('returns empty array for empty input', () => {
    expect(layoutGraph([], [])).toEqual([]);
  });

  it('positions a single node', () => {
    const nodes = [makeNode('a')];
    const result = layoutGraph(nodes, []);
    expect(result).toHaveLength(1);
    expect(result[0].position.x).toBeTypeOf('number');
    expect(result[0].position.y).toBeTypeOf('number');
  });

  it('positions two connected nodes left-to-right', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];
    const result = layoutGraph(nodes, edges, 'LR');
    // In LR layout, b should be to the right of a
    expect(result[1].position.x).toBeGreaterThan(result[0].position.x);
  });

  it('positions two connected nodes top-to-bottom', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];
    const result = layoutGraph(nodes, edges, 'TB');
    // In TB layout, b should be below a
    expect(result[1].position.y).toBeGreaterThan(result[0].position.y);
  });

  it('ignores edges referencing nonexistent nodes', () => {
    const nodes = [makeNode('a')];
    const edges = [makeEdge('a', 'ghost')];
    const result = layoutGraph(nodes, edges);
    expect(result).toHaveLength(1);
  });

  it('preserves node data through layout', () => {
    const nodes: Node<Record<string, unknown>>[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: { routePath: '/home' } },
    ];
    const result = layoutGraph(nodes, []);
    expect(result[0].data.routePath).toBe('/home');
    expect(result[0].id).toBe('a');
  });

  it('uses custom nodeHeight', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];
    const tallResult = layoutGraph(nodes, edges, 'TB', 800);
    const shortResult = layoutGraph(nodes, edges, 'TB', 200);
    // Taller nodes should push b further down
    const tallGap = tallResult[1].position.y - tallResult[0].position.y;
    const shortGap = shortResult[1].position.y - shortResult[0].position.y;
    expect(tallGap).toBeGreaterThan(shortGap);
  });

  it('uses per-node height overrides', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c')];
    const result = layoutGraph(nodes, edges, 'LR', 400, { b: 800 });
    expect(result).toHaveLength(3);
  });

  it('handles a diamond graph', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')];
    const edges = [
      makeEdge('a', 'b'),
      makeEdge('a', 'c'),
      makeEdge('b', 'd'),
      makeEdge('c', 'd'),
    ];
    const result = layoutGraph(nodes, edges);
    expect(result).toHaveLength(4);
    // All nodes should have valid positions
    for (const node of result) {
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    }
  });
});
