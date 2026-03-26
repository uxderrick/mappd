import path from 'node:path';
import fs from 'node:fs';
import { createServer } from '../server.js';
import { startWatcher } from '../watcher.js';
import { parseAndWriteGraph } from '../parse.js';
import { captureScreenshots } from '../screenshot.js';
import { detectTargetPort } from '../detect-port.js';
import pc from 'picocolors';

interface DevOptions {
  port: string;
  targetPort?: string;
  dir: string;
}

export async function devCommand(options: DevOptions) {
  const projectDir = path.resolve(options.dir);
  const port = parseInt(options.port, 10);
  const targetPort = options.targetPort
    ? parseInt(options.targetPort, 10)
    : await detectTargetPort(projectDir);

  console.log('');
  console.log(pc.bold(pc.magenta('  ⬡ Mappd')));
  console.log('');

  // Validate project directory
  if (!fs.existsSync(path.join(projectDir, 'package.json'))) {
    console.log(pc.red('  Error: No package.json found in ' + projectDir));
    console.log(pc.dim('  Run this command from your project root, or use --dir'));
    process.exit(1);
  }

  // Step 1: Parse the project
  console.log(pc.dim('  Parsing routes...'));
  const graph = parseAndWriteGraph(projectDir);

  if (graph) {
    console.log(pc.green(`  Found ${graph.nodes.length} routes and ${graph.edges.length} connections`));
    for (const node of graph.nodes) {
      console.log(pc.dim(`    ${node.routePath} → ${node.componentName}`));
    }
  }
  console.log('');

  // Step 2: Start the canvas server
  const canvasDir = path.resolve(import.meta.dirname, '../../canvas-dist');
  const flowGraphDir = path.join(projectDir, '.mappd');

  const server = createServer({ port, flowGraphDir, canvasDir, targetPort });

  // Step 3: Start file watcher
  const watcher = startWatcher(projectDir, (changedFile) => {
    console.log(pc.dim(`  File changed: ${path.relative(projectDir, changedFile)}`));
    const updated = parseAndWriteGraph(projectDir);
    if (updated) {
      server.broadcast({
        type: 'graph-update',
        graph: updated,
      });
      console.log(pc.green(`  Graph updated (${updated.nodes.length} routes, ${updated.edges.length} connections)`));
    }
  });

  console.log(pc.bold(`  Canvas:    `) + pc.cyan(`http://localhost:${port}`));
  console.log(pc.bold(`  Target:    `) + pc.cyan(`http://localhost:${targetPort}`));
  console.log(pc.bold(`  Watching:  `) + pc.dim(projectDir));
  console.log('');
  console.log(pc.dim('  Press Ctrl+C to stop'));
  console.log('');

  // Step 4: Capture screenshots in background (doesn't block startup)
  if (graph) {
    console.log(pc.dim('  Capturing screenshots...'));
    captureScreenshots(graph, {
      targetPort,
      outputDir: flowGraphDir,
    }).then(() => {
      console.log(pc.green('  Screenshots captured'));
      server.broadcast({ type: 'screenshots-ready' });
    }).catch((err) => {
      console.log(pc.yellow(`  Screenshot capture failed: ${err instanceof Error ? err.message : err}`));
    });
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    console.log(pc.dim('  Shutting down...'));
    watcher.close();
    server.close();
    process.exit(0);
  });
}
