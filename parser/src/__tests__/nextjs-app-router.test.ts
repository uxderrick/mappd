import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { extractNextjsAppRoutes } from '../extractors/nextjs-app-router.js';

const APP_DIR = path.join(import.meta.dirname, 'fixtures/nextjs-app/app');

describe('Next.js App Router extractor', () => {
  it('extracts page routes', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);

    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/');
  });

  it('detects dynamic routes', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    const slug = routes.find((r) => r.path.includes(':slug'));
    expect(slug).toBeDefined();
    expect(slug?.isDynamic).toBe(true);
  });

  it('strips route groups from paths', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    // (marketing)/page.tsx should have path /, not /(marketing)
    const paths = routes.map((r) => r.path);
    expect(paths.every((p) => !p.includes('(marketing)'))).toBe(true);
  });

  it('skips API routes', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    const apiRoute = routes.find((r) => r.path.includes('/api'));
    expect(apiRoute).toBeUndefined();
  });

  it('detects layout files', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    const dashboardLayout = routes.find((r) => r.isLayout && r.path.includes('dashboard'));
    expect(dashboardLayout).toBeDefined();
  });

  it('detects client components', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    const dashboard = routes.find((r) => r.path === '/dashboard' && !r.isLayout);
    expect(dashboard?.isClientComponent).toBe(true);
  });

  it('marks server components correctly', () => {
    const routes = extractNextjsAppRoutes(APP_DIR);
    const home = routes.find((r) => r.path === '/' && !r.isLayout);
    expect(home?.isClientComponent).toBe(false);
  });
});
