import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

const MAPPD_ENTRIES = [
  '# Mappd (auto-added)',
  '.mappd/',
  'public/mappd-inject.js',
  'mappd-inject.js',
];

/**
 * Ensure the target project's .gitignore contains Mappd entries.
 * Adds them if missing. Creates .gitignore if it doesn't exist.
 * This protects against accidental commits of Mappd's temporary files.
 */
export function ensureGitignore(projectDir: string): void {
  const gitignorePath = path.join(projectDir, '.gitignore');

  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
  }

  // Check if already has Mappd entries
  if (content.includes('.mappd/') && content.includes('mappd-inject.js')) {
    return; // Already protected
  }

  // Add entries
  const newEntries = MAPPD_ENTRIES.filter(entry => {
    if (entry.startsWith('#')) return !content.includes(entry);
    return !content.includes(entry);
  });

  if (newEntries.length === 0) return;

  const separator = content.endsWith('\n') || content === '' ? '' : '\n';
  const addition = separator + '\n' + newEntries.join('\n') + '\n';

  fs.writeFileSync(gitignorePath, content + addition, 'utf-8');
  console.log(pc.dim('  Added Mappd entries to .gitignore'));
}
