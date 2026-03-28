import path from 'node:path';
import { parseProject, parseAndWrite } from '../index.js';

const DEMO_APP_DIR = path.resolve(import.meta.dirname, '../../../demos/test/demo-react-router-v6');

console.log('Parsing demo-react-router-v6 at:', DEMO_APP_DIR);
console.log('---');

try {
  const graph = parseProject(DEMO_APP_DIR);

  console.log(`Framework: ${graph.metadata.framework}`);
  console.log(`Project: ${graph.metadata.projectName}`);
  console.log('');

  console.log(`Routes found: ${graph.nodes.length}`);
  for (const node of graph.nodes) {
    console.log(`  ${node.routePath} → ${node.componentName} (${node.componentFilePath ? 'resolved' : 'MISSING'})`);
    console.log(`    position: (${node.position.x}, ${node.position.y})`);
  }
  console.log('');

  console.log(`Edges found: ${graph.edges.length}`);
  for (const edge of graph.edges) {
    console.log(`  ${edge.sourceNodeId} → ${edge.targetNodeId} [${edge.triggerType}] "${edge.triggerLabel}"`);
  }
  console.log('');

  // Validate expected routes
  const expectedPaths = ['/', '/login', '/dashboard', '/dashboard/settings', '/dashboard/users/:id'];
  const foundPaths = graph.nodes.map((n) => n.routePath);
  const missing = expectedPaths.filter((p) => !foundPaths.includes(p));
  const extra = foundPaths.filter((p) => !expectedPaths.includes(p));

  if (missing.length) console.log('MISSING routes:', missing);
  if (extra.length) console.log('EXTRA routes:', extra);
  if (!missing.length && !extra.length) console.log('All 5 expected routes found!');

  // Validate edges exist
  if (graph.edges.length >= 5) {
    console.log(`Edge count looks good (${graph.edges.length} >= 5 expected)`);
  } else {
    console.log(`WARNING: Only ${graph.edges.length} edges found, expected at least 5`);
  }

  // Write to .mappd/flow-graph.json
  parseAndWrite(DEMO_APP_DIR);
  console.log('\nWritten to demo-react-router-v6/.mappd/flow-graph.json');
} catch (err) {
  console.error('Parse failed:', err);
  process.exit(1);
}
