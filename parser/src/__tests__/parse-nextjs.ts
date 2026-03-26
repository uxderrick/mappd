import path from 'node:path';
import { parseProject } from '../index.js';

const FIXTURE_DIR = path.resolve(import.meta.dirname, 'fixtures/nextjs-app');

console.log('Parsing Next.js App Router fixture at:', FIXTURE_DIR);
console.log('---');

try {
  const graph = parseProject(FIXTURE_DIR);

  console.log(`Framework: ${graph.metadata.framework}`);
  console.log(`Project: ${graph.metadata.projectName}`);
  console.log('');

  console.log(`Routes found: ${graph.nodes.length}`);
  for (const node of graph.nodes) {
    console.log(`  ${node.routePath} → ${node.componentName} (${node.componentFilePath ? 'resolved' : 'MISSING'})`);
  }
  console.log('');

  console.log(`Edges found: ${graph.edges.length}`);
  for (const edge of graph.edges) {
    console.log(`  ${edge.sourceNodeId} → ${edge.targetNodeId} [${edge.triggerType}] "${edge.triggerLabel}"`);
  }
  console.log('');

  const expectedPaths = ['/', '/about', '/dashboard', '/users/:id'];
  const foundPaths = graph.nodes.map((n) => n.routePath);
  const missing = expectedPaths.filter((p) => !foundPaths.includes(p));
  const extra = foundPaths.filter((p) => !expectedPaths.includes(p));

  if (missing.length) console.log('MISSING routes:', missing);
  if (extra.length) console.log('EXTRA routes:', extra);
  if (!missing.length && !extra.length) console.log('All expected routes found!');

  if (graph.edges.length >= 4) {
    console.log(`Edge count looks good (${graph.edges.length} >= 4 expected)`);
  } else {
    console.log(`WARNING: Only ${graph.edges.length} edges found, expected at least 4`);
  }
} catch (err) {
  console.error('Parse failed:', err);
  process.exit(1);
}
