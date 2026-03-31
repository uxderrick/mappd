import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { extractFlatRoutes } from '../extractors/react-router-v7.js';

const FLAT_ROUTES_DIR = path.join(import.meta.dirname, 'fixtures/react-router-v7/app/routes');

describe('React Router v7 flat routes extractor', () => {
  it('extracts flat route files', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));

    expect(routes.length).toBeGreaterThanOrEqual(5);

    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/login');
    expect(paths).toContain('/dashboard');
  });

  it('handles dot-notation routes', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));
    const settings = routes.find((r) => r.path === '/dashboard/settings');
    expect(settings).toBeDefined();
  });

  it('handles $param dynamic segments', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));
    const userDetail = routes.find((r) => r.path.includes('/users/'));
    expect(userDetail).toBeDefined();
    expect(userDetail?.isDynamic).toBe(true);
  });

  it('handles _index as index route', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));
    const index = routes.find((r) => r.path === '/');
    expect(index).toBeDefined();
    expect(index?.isIndex).toBe(true);
  });

  it('handles $ catch-all route', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));
    const catchAll = routes.find((r) => r.path.includes('*'));
    expect(catchAll).toBeDefined();
  });

  it('handles _ prefix as pathless layout', () => {
    const routes = extractFlatRoutes(FLAT_ROUTES_DIR, path.join(import.meta.dirname, 'fixtures/react-router-v7'));
    const authRegister = routes.find((r) => r.path === '/register');
    expect(authRegister).toBeDefined();
    // _auth prefix is a pathless layout — register should be at /register, not /auth/register
    expect(authRegister?.isLayout).toBe(true);
  });
});
