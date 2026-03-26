import chokidar from 'chokidar';
import path from 'node:path';

const WATCH_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.mappd/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
];

export function startWatcher(
  projectDir: string,
  onChange: (filePath: string) => void,
) {
  // Watch src directory if it exists, otherwise project root
  const watchDir = path.join(projectDir, 'src');

  const watcher = chokidar.watch(watchDir, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    ignoreInitial: true,
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
