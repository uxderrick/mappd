import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

/**
 * Framework detection table.
 * Each entry maps framework signals (deps or script keywords) to default ports
 * and a preferred port probe order.
 *
 * Supported frameworks:
 * - Vite (React Router v6 SPA, plain React) → 5173
 * - Next.js (App Router, Pages Router)       → 3000
 * - React Router v7 (framework mode / Vite)  → 5173
 * - Create React App                         → 3000
 * - Remix (classic)                          → 3000
 * - Webpack Dev Server                       → 8080
 */
const FRAMEWORK_SIGNALS: {
  name: string;
  deps: string[];
  scriptKeywords: string[];
  defaultPort: number;
  probePorts: number[];
}[] = [
  {
    name: 'Next.js',
    deps: ['next'],
    scriptKeywords: ['next dev', 'next'],
    defaultPort: 3000,
    probePorts: [3000, 3001, 3002],
  },
  {
    name: 'Remix',
    deps: ['@remix-run/dev', '@remix-run/react'],
    scriptKeywords: ['remix dev'],
    defaultPort: 3000,
    probePorts: [3000, 3001, 5173],
  },
  {
    name: 'React Router v7 (framework)',
    deps: ['@react-router/dev', '@react-router/node'],
    scriptKeywords: ['react-router dev'],
    defaultPort: 5173,
    probePorts: [5173, 5174, 3000, 3001],
  },
  {
    name: 'Vite',
    deps: ['vite'],
    scriptKeywords: ['vite'],
    defaultPort: 5173,
    probePorts: [5173, 5174, 4173, 3000, 3001],
  },
  {
    name: 'Create React App',
    deps: ['react-scripts'],
    scriptKeywords: ['react-scripts start'],
    defaultPort: 3000,
    probePorts: [3000, 3001],
  },
  {
    name: 'Webpack Dev Server',
    deps: ['webpack-dev-server'],
    scriptKeywords: ['webpack serve', 'webpack-dev-server'],
    defaultPort: 8080,
    probePorts: [8080, 8000, 3000],
  },
];

const FALLBACK_PROBE_ORDER = [5173, 3000, 3001, 5174, 8080, 8000, 4173];

/**
 * Try to detect the target project's dev server port.
 *
 * Strategy:
 * 1. Extract an explicit --port / -p flag from the dev script.
 * 2. Detect the framework from deps + script keywords, then probe its default ports first.
 * 3. Fall back to probing all common ports.
 * 4. Give up and return the framework's default (or 3000).
 */
export async function detectTargetPort(projectDir: string): Promise<number> {
  const pkg = readPackageJson(projectDir);
  const devScript = pkg?.scripts?.dev ?? '';

  // 1. Explicit port in the dev script (--port 3000, --port=3000, -p 3000)
  const hintPort = extractPortFlag(devScript);
  if (hintPort) {
    const alive = await isPortResponding(hintPort);
    if (alive) {
      console.log(pc.dim(`  Auto-detected target port ${hintPort} (from package.json dev script)`));
      return hintPort;
    }
  }

  // 2. Detect framework and use its probe order
  const framework = detectFramework(pkg, devScript);
  const probePorts = framework?.probePorts ?? FALLBACK_PROBE_ORDER;
  const defaultPort = framework?.defaultPort ?? 3000;

  if (framework) {
    console.log(pc.dim(`  Detected ${framework.name} project`));
  }

  for (const port of probePorts) {
    const alive = await isPortResponding(port);
    if (alive) {
      console.log(pc.dim(`  Auto-detected target port ${port}`));
      return port;
    }
  }

  // 3. Try remaining common ports not already probed
  for (const port of FALLBACK_PROBE_ORDER) {
    if (probePorts.includes(port)) continue;
    const alive = await isPortResponding(port);
    if (alive) {
      console.log(pc.dim(`  Auto-detected target port ${port}`));
      return port;
    }
  }

  // 4. Nothing responding — fall back to framework default
  console.log(pc.yellow(`  Warning: Could not detect a running dev server. Falling back to port ${defaultPort}.`));
  console.log(pc.yellow('  Start your dev server, or pass --target-port explicitly.'));
  return defaultPort;
}

function readPackageJson(projectDir: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Detect framework by checking dependencies first (most reliable),
 * then falling back to dev script keyword matching.
 */
function detectFramework(pkg: any, devScript: string) {
  if (!pkg) return null;

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Check deps first — more reliable than script string matching
  for (const fw of FRAMEWORK_SIGNALS) {
    if (fw.deps.some(dep => dep in allDeps)) {
      return fw;
    }
  }

  // Fallback: match script keywords (handles edge cases)
  for (const fw of FRAMEWORK_SIGNALS) {
    if (fw.scriptKeywords.some(kw => devScript.includes(kw))) {
      return fw;
    }
  }

  return null;
}

/**
 * Extract an explicit port number from a dev script string.
 * Matches: --port 3000, --port=3000, -p 3000
 */
function extractPortFlag(devScript: string): number | null {
  if (!devScript) return null;
  const match = devScript.match(/(?:--port[=\s]|-p\s+)(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if a port responds to an HTTP request.
 * Uses a short timeout so scanning is fast.
 */
async function isPortResponding(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`http://localhost:${port}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}
