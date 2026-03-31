import path from 'node:path';
import fs from 'node:fs';
import { createServer } from '../server.js';
import { startWatcher } from '../watcher.js';
import { parseAndWriteGraph, parseWithConfig } from '../parse.js';
import { captureScreenshots, closeBrowser } from '../screenshot.js';
import { detectTargetPort } from '../detect-port.js';
import { loadSavedConfig, promptForConfig } from '../prompt.js';
import { ensureGitignore } from '../gitignore.js';
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

  // Ensure .gitignore protects Mappd files
  ensureGitignore(projectDir);

  // Step 1: Wait for target dev server
  await waitForDevServer(targetPort);

  // Step 2: Parse the project
  // Try: auto-detect → saved config → interactive prompt
  console.log(pc.dim('  Parsing routes...'));
  let graph = parseAndWriteGraph(projectDir);

  if (!graph) {
    // Auto-detect failed — try saved config
    const savedConfig = loadSavedConfig(projectDir);
    if (savedConfig) {
      graph = parseWithConfig(projectDir, savedConfig);
    }
  }

  if (!graph) {
    // Still no luck — prompt the user
    const manualConfig = await promptForConfig(projectDir);
    graph = parseWithConfig(projectDir, manualConfig);

    // Update target port if user specified one during prompt
    if (manualConfig.targetPort && !options.targetPort) {
      // Can't reassign const, but the server hasn't started yet
      // so we'll use the prompted port
    }
  }

  if (graph) {
    console.log(pc.green(`  Found ${graph.nodes.length} routes and ${graph.edges.length} connections`));
    for (const node of graph.nodes) {
      console.log(pc.dim(`    ${node.routePath} → ${node.componentName}`));
    }
  } else {
    console.log(pc.yellow('  No routes detected. The canvas will be empty.'));
    console.log(pc.dim('  Check your project structure or configure manually with .mappd/config.json'));
  }
  console.log('');

  // Step 3: Inject mappd-inject.js into target project
  // In the built bundle (dist/index.js), canvas-dist is a sibling of dist/
  // import.meta.dirname = <pkg>/dist/, so ../canvas-dist = <pkg>/canvas-dist/
  const canvasDir = path.resolve(import.meta.dirname, '../canvas-dist');
  const flowGraphDir = path.join(projectDir, '.mappd');
  const injection = injectScript(projectDir, canvasDir);

  const server = createServer({ port, flowGraphDir, canvasDir, targetPort });

  // Step 5: Start file watcher
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

  // Step 5: Capture screenshots in background (doesn't block startup)
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
  process.on('SIGINT', async () => {
    console.log('');
    console.log(pc.dim('  Shutting down...'));
    watcher.close();
    server.close();
    await closeBrowser();
    // Clean up injected files
    if (injection) {
      cleanupInjection(injection);
    }
    process.exit(0);
  });
}

interface Injection {
  scriptPath: string;        // path to copied mappd-inject.js
  htmlPath: string | null;   // path to modified HTML/layout file
  htmlBackup: string | null; // original content of the HTML file
}

/**
 * Inject mappd-inject.js into the target project:
 * 1. Copy the script to the project's public/ directory
 * 2. Add a <script> tag to the HTML entry point so it loads automatically
 *
 * On shutdown, the script file is deleted and the HTML is restored.
 */
function injectScript(projectDir: string, canvasDir: string): Injection | null {
  const scriptSrc = path.join(canvasDir, 'mappd-inject.js');
  if (!fs.existsSync(scriptSrc)) return null;

  // Build list of directories to search — project root + monorepo sub-packages
  const searchRoots = [projectDir];
  for (const subDir of ['apps', 'packages']) {
    const dir = path.join(projectDir, subDir);
    if (fs.existsSync(dir)) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            searchRoots.push(path.join(dir, entry.name));
          }
        }
      } catch {}
    }
  }

  // Step 1: Copy script to public/ — search all roots
  const publicDirNames = ['public', 'static', path.join('app', 'public'), path.join('src', 'public')];
  let publicDir: string | null = null;

  for (const root of searchRoots) {
    for (const dir of publicDirNames) {
      const fullDir = path.join(root, dir);
      if (fs.existsSync(fullDir) && fs.statSync(fullDir).isDirectory()) {
        publicDir = fullDir;
        break;
      }
    }
    if (publicDir) break;
  }

  if (!publicDir) {
    publicDir = path.join(projectDir, 'public');
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const scriptDst = path.join(publicDir, 'mappd-inject.js');
  fs.copyFileSync(scriptSrc, scriptDst);

  // Step 2: Add <script> tag to HTML entry point
  const SCRIPT_TAG = '<script src="/mappd-inject.js"></script>';
  const htmlCandidates = [
    'index.html',                       // Vite, CRA
    path.join('src', 'index.html'),     // some CRA setups
  ];

  // Search all roots for HTML entry point (Vite/CRA: index.html)
  for (const root of searchRoots) {
    for (const candidate of htmlCandidates) {
      const htmlPath = path.join(root, candidate);
      if (!fs.existsSync(htmlPath)) continue;

      const original = fs.readFileSync(htmlPath, 'utf-8');
      if (original.includes('mappd-inject.js')) {
        console.log(pc.dim(`  Script already in ${path.relative(projectDir, htmlPath)}`));
        return { scriptPath: scriptDst, htmlPath, htmlBackup: original };
      }

      let modified: string;
      if (original.includes('</head>')) {
        modified = original.replace('</head>', `  ${SCRIPT_TAG}\n  </head>`);
      } else if (original.includes('<body>')) {
        modified = original.replace('<body>', `<body>\n  ${SCRIPT_TAG}`);
      } else {
        modified = SCRIPT_TAG + '\n' + original;
      }

      fs.writeFileSync(htmlPath, modified, 'utf-8');
      console.log(pc.dim(`  Injected script tag into ${path.relative(projectDir, htmlPath)}`));
      return { scriptPath: scriptDst, htmlPath, htmlBackup: original };
    }
  }

  // Search all roots for Next.js layout files
  const nextLayoutFiles = [
    path.join('app', 'layout.tsx'),
    path.join('app', 'layout.jsx'),
    path.join('app', 'layout.ts'),
    path.join('app', 'layout.js'),
    path.join('src', 'app', 'layout.tsx'),
    path.join('src', 'app', 'layout.jsx'),
  ];

  for (const root of searchRoots) {
    for (const file of nextLayoutFiles) {
      const layoutPath = path.join(root, file);
      if (!fs.existsSync(layoutPath)) continue;

      const original = fs.readFileSync(layoutPath, 'utf-8');
      if (original.includes('mappd-inject.js')) {
        console.log(pc.dim(`  Script already in ${path.relative(projectDir, layoutPath)}`));
        return { scriptPath: scriptDst, htmlPath: layoutPath, htmlBackup: original };
      }

      let modified: string;
      const headMatch = original.match(/<head[^>]*>/i);
      if (headMatch) {
        modified = original.replace(headMatch[0], `${headMatch[0]}\n        <script src="/mappd-inject.js"></script>`);
      } else if (original.includes('<html')) {
        modified = original.replace(
          /(<html[^>]*>)/i,
          `$1\n      <head>\n        <script src="/mappd-inject.js" defer></script>\n      </head>`
        );
      } else {
        continue;
      }

      fs.writeFileSync(layoutPath, modified, 'utf-8');
      console.log(pc.dim(`  Injected script tag into ${path.relative(projectDir, layoutPath)}`));
      return { scriptPath: scriptDst, htmlPath: layoutPath, htmlBackup: original };
    }
  }

  console.log(pc.dim(`  Copied mappd-inject.js to public/ (add <script src="/mappd-inject.js"></script> to your HTML manually)`));
  return { scriptPath: scriptDst, htmlPath: null, htmlBackup: null };
}

/**
 * Clean up: remove the script file and restore the original HTML.
 */
function cleanupInjection(injection: Injection): void {
  try { fs.unlinkSync(injection.scriptPath); } catch {}

  if (injection.htmlPath && injection.htmlBackup) {
    try {
      fs.writeFileSync(injection.htmlPath, injection.htmlBackup, 'utf-8');
    } catch {}
  }
}

/**
 * Wait for the target dev server to be reachable.
 * Polls every 2 seconds, up to 60 seconds.
 */
async function waitForDevServer(port: number): Promise<void> {
  const maxWait = 60_000;
  const interval = 2_000;
  const start = Date.now();

  // Quick check first
  if (await isPortReachable(port)) return;

  console.log(pc.yellow(`  Waiting for dev server on port ${port}...`));
  console.log(pc.dim(`  Start your dev server in another terminal (e.g., npm run dev)`));
  console.log('');

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, interval));
    if (await isPortReachable(port)) {
      console.log(pc.green(`  Dev server detected on port ${port}`));
      console.log('');
      return;
    }
  }

  console.log(pc.yellow(`  Dev server not detected after ${maxWait / 1000}s — continuing anyway`));
  console.log(pc.dim(`  Screenshots and live previews may not work until the server is running`));
  console.log('');
}

async function isPortReachable(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`http://localhost:${port}/`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}
