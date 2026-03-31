import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadSavedConfig } from '../prompt';

describe('prompt', () => {
  const tmpDir = path.join(import.meta.dirname, '__tmp_prompt__');

  beforeEach(() => {
    fs.mkdirSync(path.join(tmpDir, '.mappd'), { recursive: true });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('loadSavedConfig', () => {
    it('returns null when config file does not exist', () => {
      const emptyDir = path.join(tmpDir, 'empty');
      fs.mkdirSync(emptyDir, { recursive: true });
      expect(loadSavedConfig(emptyDir)).toBeNull();
    });

    it('loads a valid config', () => {
      const config = {
        framework: 'react-router',
        entryPoint: 'src/main.tsx',
        targetPort: 5173,
      };
      fs.writeFileSync(
        path.join(tmpDir, '.mappd', 'config.json'),
        JSON.stringify(config),
      );
      const result = loadSavedConfig(tmpDir);
      expect(result).toEqual(config);
    });

    it('returns null for config missing framework', () => {
      fs.writeFileSync(
        path.join(tmpDir, '.mappd', 'config.json'),
        JSON.stringify({ entryPoint: 'src/main.tsx' }),
      );
      expect(loadSavedConfig(tmpDir)).toBeNull();
    });

    it('returns null for config missing entryPoint', () => {
      fs.writeFileSync(
        path.join(tmpDir, '.mappd', 'config.json'),
        JSON.stringify({ framework: 'react-router' }),
      );
      expect(loadSavedConfig(tmpDir)).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      fs.writeFileSync(
        path.join(tmpDir, '.mappd', 'config.json'),
        'not json!!!',
      );
      expect(loadSavedConfig(tmpDir)).toBeNull();
    });
  });
});
