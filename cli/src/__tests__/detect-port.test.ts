import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { detectTargetPort } from '../detect-port';

describe('detectTargetPort', () => {
  const tmpDir = path.join(import.meta.dirname, '__tmp_detect_port__');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('detects port from --port flag in dev script', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'vite --port 4000' }, devDependencies: { vite: '1.0.0' } }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('4000')) return new Response('ok');
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(4000);
  });

  it('detects port from -p flag in dev script', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'next dev -p 3001' }, dependencies: { next: '14.0.0' } }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('3001')) return new Response('ok');
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3001);
  });

  it('probes 5173 first for Vite projects', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'vite' }, devDependencies: { vite: '5.0.0' } }),
    );
    // Both 3000 and 5173 respond, but Vite should pick 5173 first
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('5173') || String(url).includes('3000')) {
        return new Response('ok');
      }
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(5173);
  });

  it('probes 3000 first for Next.js projects', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'next dev' }, dependencies: { next: '14.0.0' } }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('3000') || String(url).includes('5173')) {
        return new Response('ok');
      }
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3000);
  });

  it('detects Vite from devDependencies even with concurrently wrapper', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'concurrently "vite --mode ws" "cd server && npx tsx watch src/index.ts"' },
        devDependencies: { vite: '5.0.0' },
      }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('5173') || String(url).includes('3000')) {
        return new Response('ok');
      }
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(5173);
  });

  it('falls back to framework default when no server responds', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'vite' }, devDependencies: { vite: '5.0.0' } }),
    );
    const port = await detectTargetPort(tmpDir);
    // Vite default is 5173
    expect(port).toBe(5173);
  });

  it('falls back to 3000 for Next.js when no server responds', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ scripts: { dev: 'next dev' }, dependencies: { next: '14.0.0' } }),
    );
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3000);
  });

  it('handles missing package.json gracefully', async () => {
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(3000);
  });

  it('detects React Router v7 framework mode as Vite-based', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        scripts: { dev: 'react-router dev' },
        devDependencies: { '@react-router/dev': '7.0.0' },
      }),
    );
    vi.mocked(globalThis.fetch).mockImplementation(async (url) => {
      if (String(url).includes('5173')) return new Response('ok');
      throw new Error('refused');
    });
    const port = await detectTargetPort(tmpDir);
    expect(port).toBe(5173);
  });
});
