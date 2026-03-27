import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

export interface PromptConfig {
  framework: 'react-router' | 'react-router-v7' | 'nextjs-app' | 'nextjs-pages';
  entryPoint: string;
  targetPort: number;
}

const CONFIG_FILE = '.mappd/config.json';

const FRAMEWORKS = [
  { key: 'react-router', label: 'React Router (v6 SPA)', deps: ['react-router-dom', 'react-router'] },
  { key: 'react-router-v7', label: 'React Router v7 (framework mode)', deps: ['@react-router/dev', '@react-router/node'] },
  { key: 'nextjs-app', label: 'Next.js App Router (/app)', deps: ['next'] },
  { key: 'nextjs-pages', label: 'Next.js Pages Router (/pages)', deps: ['next'] },
] as const;

const ENTRY_CANDIDATES: Record<PromptConfig['framework'], string[]> = {
  'react-router': ['src/main.tsx', 'src/main.ts', 'src/App.tsx', 'src/App.ts', 'src/index.tsx', 'src/index.ts', 'src/router.tsx', 'src/routes.tsx'],
  'react-router-v7': ['app/routes.ts', 'app/routes.tsx', 'src/routes.ts', 'src/routes.tsx', 'app/routes'],
  'nextjs-app': ['app', 'src/app'],
  'nextjs-pages': ['pages', 'src/pages'],
};

/**
 * Load saved config from .mappd/config.json if it exists.
 */
export function loadSavedConfig(projectDir: string): PromptConfig | null {
  const configPath = path.join(projectDir, CONFIG_FILE);
  if (!fs.existsSync(configPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (raw.framework && raw.entryPoint) {
      console.log(pc.dim(`  Using saved config from ${CONFIG_FILE}`));
      return raw as PromptConfig;
    }
  } catch {}
  return null;
}

/**
 * Save config to .mappd/config.json for future runs.
 */
function saveConfig(projectDir: string, config: PromptConfig): void {
  const dir = path.join(projectDir, '.mappd');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

/**
 * Scan package.json deps to detect which frameworks are installed.
 * Returns an array of matching framework keys.
 */
function detectInstalledFrameworks(projectDir: string): string[] {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const detected: string[] = [];
    for (const fw of FRAMEWORKS) {
      if (fw.deps.some(dep => dep in allDeps)) {
        detected.push(fw.key);
      }
    }
    return detected;
  } catch {
    return [];
  }
}

/**
 * Try to detect the target dev server port from package.json scripts.
 */
function detectPortFromScripts(projectDir: string): number {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'));
    const devScript = pkg.scripts?.dev || pkg.scripts?.start || '';
    // Look for --port NNNN or -p NNNN
    const portMatch = devScript.match(/(?:--port|-p)\s+(\d{4,5})/);
    if (portMatch) return parseInt(portMatch[1], 10);
    // Next.js default
    if (devScript.includes('next')) return 3000;
    // Vite default
    if (devScript.includes('vite')) return 5173;
  } catch {}
  return 3000;
}

/**
 * Find the first existing entry point candidate for a framework.
 */
function findDefaultEntry(projectDir: string, framework: PromptConfig['framework']): string {
  const candidates = ENTRY_CANDIDATES[framework];
  return candidates.find(c => fs.existsSync(path.join(projectDir, c))) ?? candidates[0];
}

/**
 * Prompt the user to select their framework and entry point.
 * Scans deps to pre-highlight the likely framework.
 * Validates entry point exists. Saves config for future runs.
 */
export async function promptForConfig(projectDir: string): Promise<PromptConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  console.log('');
  console.log(pc.yellow('  Could not auto-detect your routing framework.'));
  console.log(pc.dim('  Answer 3 questions to configure manually. This only happens once.'));
  console.log('');

  // Detect installed frameworks
  const detected = detectInstalledFrameworks(projectDir);

  // Step 1: Select framework
  console.log(pc.bold('  1. Which routing framework?'));
  console.log('');
  FRAMEWORKS.forEach((fw, i) => {
    const isDetected = detected.includes(fw.key);
    const num = `${i + 1}`;
    const badge = isDetected ? pc.green(' (detected)') : '';
    const line = `    ${num}) ${fw.label}${badge}`;
    console.log(isDetected ? pc.white(line) : pc.dim(line));
  });
  console.log('');

  // Default to first detected framework, or 1
  const defaultFw = detected.length > 0
    ? FRAMEWORKS.findIndex(fw => fw.key === detected[0]) + 1
    : 1;

  const fwAnswer = await ask(
    pc.bold(`  Choose `) + pc.dim(`[${defaultFw}]: `)
  );
  const fwIndex = (parseInt(fwAnswer.trim(), 10) || defaultFw) - 1;
  const framework = FRAMEWORKS[Math.min(Math.max(fwIndex, 0), FRAMEWORKS.length - 1)].key as PromptConfig['framework'];
  console.log(pc.dim(`  → ${FRAMEWORKS.find(f => f.key === framework)!.label}`));

  // Step 2: Entry point with validation
  const defaultEntry = findDefaultEntry(projectDir, framework);
  console.log('');
  console.log(pc.bold('  2. Entry point'));
  console.log(pc.dim(`     Where your routes are defined`));
  console.log('');

  let entryPoint = '';
  let attempts = 0;
  while (attempts < 3) {
    const entryAnswer = await ask(
      pc.bold('  Path ') + pc.dim(`[${defaultEntry}]: `)
    );
    entryPoint = entryAnswer.trim() || defaultEntry;

    const fullPath = path.join(projectDir, entryPoint);
    if (fs.existsSync(fullPath)) {
      console.log(pc.green(`  → Found: ${entryPoint}`));
      break;
    }

    attempts++;
    if (attempts < 3) {
      console.log(pc.yellow(`  "${entryPoint}" not found. Try again.`));
      // Show existing candidates
      const candidates = ENTRY_CANDIDATES[framework];
      const existing = candidates.filter(c => fs.existsSync(path.join(projectDir, c)));
      if (existing.length > 0) {
        console.log(pc.dim(`  Found these: ${existing.join(', ')}`));
      }
    } else {
      console.log(pc.yellow(`  Using "${entryPoint}" anyway (may fail to parse)`));
    }
  }

  // Step 3: Target port with smart detection
  const detectedPort = detectPortFromScripts(projectDir);
  console.log('');
  console.log(pc.bold('  3. Dev server port'));
  console.log('');
  const portAnswer = await ask(
    pc.bold('  Port ') + pc.dim(`[${detectedPort}]: `)
  );
  const targetPort = parseInt(portAnswer.trim(), 10) || detectedPort;
  console.log(pc.dim(`  → localhost:${targetPort}`));

  rl.close();

  const config: PromptConfig = { framework, entryPoint, targetPort };

  // Save for future runs
  saveConfig(projectDir, config);
  console.log('');
  console.log(pc.green(`  ✓ Saved to ${CONFIG_FILE}`));
  console.log(pc.dim(`    Delete ${CONFIG_FILE} to reconfigure.`));
  console.log('');

  return config;
}
