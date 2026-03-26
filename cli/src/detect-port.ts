import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

const COMMON_PORTS = [3000, 3001, 5173, 5174, 8080, 8000];

/**
 * Try to detect the target project's dev server port.
 *
 * Strategy:
 * 1. Read the project's package.json dev script for a --port flag hint.
 * 2. Probe common ports in order — the first one that responds wins.
 * 3. Fall back to 3000 with a warning if nothing responds.
 */
export async function detectTargetPort(projectDir: string): Promise<number> {
  // 1. Try to extract a port hint from the dev script
  const hintPort = getPortFromDevScript(projectDir);
  if (hintPort) {
    const alive = await isPortResponding(hintPort);
    if (alive) {
      console.log(pc.dim(`  Auto-detected target port ${hintPort} (from package.json dev script)`));
      return hintPort;
    }
  }

  // 2. Probe common ports
  for (const port of COMMON_PORTS) {
    const alive = await isPortResponding(port);
    if (alive) {
      console.log(pc.dim(`  Auto-detected target port ${port}`));
      return port;
    }
  }

  // 3. Fall back
  console.log(pc.yellow('  Warning: Could not detect a running dev server. Falling back to port 3000.'));
  console.log(pc.yellow('  Start your dev server, or pass --target-port explicitly.'));
  return 3000;
}

/**
 * Parse the project's package.json "dev" script for a --port flag.
 * Returns the port number if found, otherwise null.
 */
function getPortFromDevScript(projectDir: string): number | null {
  try {
    const pkgPath = path.join(projectDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const devScript: string | undefined = pkg.scripts?.dev;
    if (!devScript) return null;

    // Match patterns like --port 3000, --port=3000, -p 3000
    const match = devScript.match(/(?:--port[=\s]|-p\s+)(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  } catch {
    // package.json unreadable — not fatal
  }
  return null;
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
    // Any response (even 404) means a server is listening
    return true;
  } catch {
    return false;
  }
}
