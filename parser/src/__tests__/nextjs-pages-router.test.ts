import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { extractNextjsPagesRoutes } from '../extractors/nextjs-pages-router.js';

const PAGES_DIR = path.join(import.meta.dirname, 'fixtures/nextjs-pages/pages');

describe('Next.js Pages Router extractor', () => {
  it('extracts page routes', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);

    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/login');
  });

  it('skips _app and _document', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);
    const paths = routes.map((r) => r.path);
    expect(paths.every((p) => !p.includes('_app'))).toBe(true);
  });

  it('skips API routes', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);
    const apiRoute = routes.find((r) => r.path.includes('/api'));
    expect(apiRoute).toBeUndefined();
  });

  it('handles dynamic routes', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);
    const userDetail = routes.find((r) => r.path.includes(':id'));
    expect(userDetail).toBeDefined();
    expect(userDetail?.isDynamic).toBe(true);
  });

  it('detects getLayout pattern', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);
    const dashboard = routes.find((r) => r.path === '/dashboard');
    expect(dashboard?.layoutPattern).toBe('getLayout');
  });

  it('handles index files as parent path routes', () => {
    const routes = extractNextjsPagesRoutes(PAGES_DIR);
    const home = routes.find((r) => r.path === '/');
    expect(home).toBeDefined();
    expect(home?.isIndex).toBe(true);
  });
});
