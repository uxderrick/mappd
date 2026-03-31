import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { extractReactRouterRoutes } from '../extractors/react-router.js';

const FIXTURE_DIR = path.join(import.meta.dirname, 'fixtures/react-router-v6');

describe('React Router v6 extractor', () => {
  it('extracts routes from createBrowserRouter', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));

    expect(routes.length).toBeGreaterThanOrEqual(6);

    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/login');
    expect(paths).toContain('/dashboard');
    expect(paths).toContain('/dashboard/settings');
    expect(paths).toContain('/dashboard/users/:id');
    expect(paths).toContain('/dashboard/analytics');
  });

  it('detects catch-all route', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const catchAll = routes.find((r) => r.path === '/*');
    expect(catchAll).toBeDefined();
    expect(catchAll?.componentName).toBe('NotFound');
  });

  it('detects dynamic routes', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const userDetail = routes.find((r) => r.path === '/dashboard/users/:id');
    expect(userDetail).toBeDefined();
    expect(userDetail?.isDynamic).toBe(true);
  });

  it('detects lazy-loaded routes', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const userDetail = routes.find((r) => r.path === '/dashboard/users/:id');
    expect(userDetail?.isLazy).toBe(true);
  });

  it('detects lazy with .then() pattern', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const analytics = routes.find((r) => r.path === '/dashboard/analytics');
    expect(analytics?.isLazy).toBe(true);
  });

  it('detects auth guard wrapper', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const dashboard = routes.find((r) => r.path === '/dashboard');
    expect(dashboard?.isProtected).toBe(true);
    expect(dashboard?.guardName).toBe('ProtectedRoute');
  });

  it('propagates guard to children', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const settings = routes.find((r) => r.path === '/dashboard/settings');
    expect(settings?.isProtected).toBe(true);
  });

  it('marks non-dynamic routes correctly', () => {
    const routes = extractReactRouterRoutes(path.join(FIXTURE_DIR, 'main.tsx'));
    const home = routes.find((r) => r.path === '/');
    expect(home?.isDynamic).toBe(false);
  });
});
