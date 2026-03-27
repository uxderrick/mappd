import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

interface PromptConfig {
  framework: 'react-router' | 'nextjs-app' | 'nextjs-pages';
  entryPoint: string;
  targetPort: number;
}

const CONFIG_FILE = '.mappd/config.json';

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
 * Prompt the user to select their framework and entry point.
 * Returns a config that can be passed to the parser.
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
  console.log(pc.dim('  Let\'s set it up manually. This only needs to happen once.'));
  console.log('');

  // Step 1: Select framework
  console.log('  Which routing framework does this project use?');
  console.log('');
  console.log(pc.dim('    1) React Router (v6+)'));
  console.log(pc.dim('    2) Next.js App Router (/app directory)'));
  console.log(pc.dim('    3) Next.js Pages Router (/pages directory)'));
  console.log('');

  let framework: PromptConfig['framework'] = 'react-router';
  const fwAnswer = await ask(pc.bold('  Enter 1, 2, or 3: '));
  switch (fwAnswer.trim()) {
    case '2':
      framework = 'nextjs-app';
      break;
    case '3':
      framework = 'nextjs-pages';
      break;
    default:
      framework = 'react-router';
  }

  // Step 2: Entry point
  let defaultEntry = '';
  if (framework === 'react-router') {
    // Suggest common entry files
    const candidates = [
      'src/main.tsx', 'src/main.ts', 'src/App.tsx', 'src/App.ts',
      'src/index.tsx', 'src/index.ts', 'src/router.tsx', 'src/routes.tsx',
    ];
    defaultEntry = candidates.find(c => fs.existsSync(path.join(projectDir, c))) ?? 'src/main.tsx';
  } else if (framework === 'nextjs-app') {
    const candidates = ['app', 'src/app'];
    defaultEntry = candidates.find(c => fs.existsSync(path.join(projectDir, c))) ?? 'app';
  } else {
    const candidates = ['pages', 'src/pages'];
    defaultEntry = candidates.find(c => fs.existsSync(path.join(projectDir, c))) ?? 'pages';
  }

  console.log('');
  const entryAnswer = await ask(
    pc.bold(`  Entry point `) + pc.dim(`[${defaultEntry}]: `)
  );
  const entryPoint = entryAnswer.trim() || defaultEntry;

  // Step 3: Target port
  console.log('');
  const portAnswer = await ask(
    pc.bold('  Dev server port ') + pc.dim('[3000]: ')
  );
  const targetPort = parseInt(portAnswer.trim(), 10) || 3000;

  rl.close();

  const config: PromptConfig = { framework, entryPoint, targetPort };

  // Save for future runs
  saveConfig(projectDir, config);
  console.log('');
  console.log(pc.green(`  Saved to ${CONFIG_FILE} — won't ask again.`));
  console.log(pc.dim(`  Delete ${CONFIG_FILE} to reconfigure.`));
  console.log('');

  return config;
}
