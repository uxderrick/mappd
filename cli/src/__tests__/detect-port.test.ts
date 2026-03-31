import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { detectTargetPort } from '../detect-port';

describe('detectTargetPort', () => {
  const tmpDir = path.join(import.meta.dirname, '__tmp_detect_port__');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // Mock fetch globally — no real servers running
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('falls back to 3000 when no server is running', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'vite' } }),
    );
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3000);
  });

  it('detects port from --port flag in dev script', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'vite --port 4000' } }),
    );
    // Mock that port 4000 is responding
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('4000')) {
        return new Response('ok');
      }
      throw new Error('refused');
    });

    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(4000);
  });

  it('detects port from -p flag in dev script', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'next dev -p 3001' } }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('3001')) return new Response('ok');
      throw new Error('refused');
    });

    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3001);
  });

  it('probes common ports when no script hint', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'node server.js' } }),
    );
    // Only port 5173 responds
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('5173')) return new Response('ok');
      throw new Error('refused');
    });

    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(5173);
  });

  it('handles missing package.json gracefully', async () => {
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3000);
  });
});
