import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ensureGitignore } from '../gitignore';

describe('ensureGitignore', () => {
  const tmpDir = path.join(import.meta.dirname, '__tmp_gitignore__');
  const gitignorePath = path.join(tmpDir, '.gitignore');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('creates .gitignore if it does not exist', () => {
    ensureGitignore(tmpDir);
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.mappd/');
    expect(content).toContain('mappd-inject.js');
  });

  it('appends entries to existing .gitignore', () => {
    fs.writeFileSync(gitignorePath, 'node_modules/\n', 'utf-8');
    ensureGitignore(tmpDir);
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('.mappd/');
    expect(content).toContain('mappd-inject.js');
  });

  it('does not duplicate entries on repeated calls', () => {
    ensureGitignore(tmpDir);
    const first = fs.readFileSync(gitignorePath, 'utf-8');
    ensureGitignore(tmpDir);
    const second = fs.readFileSync(gitignorePath, 'utf-8');
    expect(first).toBe(second);
  });

  it('is a no-op when all entries already present', () => {
    fs.writeFileSync(
      gitignorePath,
      '.mappd/\nmappd-inject.js\npublic/mappd-inject.js\n',
      'utf-8',
    );
    const before = fs.readFileSync(gitignorePath, 'utf-8');
    ensureGitignore(tmpDir);
    const after = fs.readFileSync(gitignorePath, 'utf-8');
    expect(after).toBe(before);
  });

  it('handles .gitignore without trailing newline', () => {
    fs.writeFileSync(gitignorePath, 'node_modules/', 'utf-8');
    ensureGitignore(tmpDir);
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    // Should have a newline separator before mappd entries
    expect(content).toMatch(/node_modules\/\n/);
    expect(content).toContain('.mappd/');
  });
});
