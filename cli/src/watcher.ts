import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

const WATCH_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.mappd/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/.cache/**',
  '**/.git/**',
  '**/coverage/**',
];

export function startWatcher(
  projectDir: string,
  onChange: (filePath: string) => void,
) {
  const srcDir = path.join(projectDir, 'src');
  const appDir = path.join(projectDir, 'app');
  let watchDir: string;
  if (fs.existsSync(srcDir)) watchDir = srcDir;
  else if (fs.existsSync(appDir)) watchDir = appDir;
  else watchDir = projectDir;

  const watcher = chokidar.watch(watchDir, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    ignoreInitial: true,
    depth: 8,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 50,
    },
  });

  // Debounce to avoid multiple rapid re-parses
  let timeout: NodeJS.Timeout | null = null;
  let pendingFile: string | null = null;

  const debouncedChange = (filePath: string) => {
    const ext = path.extname(filePath);
    if (!WATCH_EXTENSIONS.includes(ext)) return;

    pendingFile = filePath;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (pendingFile) {
        onChange(pendingFile);
        pendingFile = null;
      }
    }, 300);
  };

  watcher.on('change', debouncedChange);
  watcher.on('add', debouncedChange);
  watcher.on('unlink', debouncedChange);

  return watcher;
}
