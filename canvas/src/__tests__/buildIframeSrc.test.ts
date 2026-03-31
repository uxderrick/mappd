import { describe, it, expect } from 'vitest';
import { buildIframeSrc } from '../lib/buildIframeSrc';

describe('buildIframeSrc', () => {
  const devServer = 'http://localhost:5173';

  it('builds a simple static route', () => {
    expect(buildIframeSrc(devServer, '/dashboard')).toBe(
      'http://localhost:5173/dashboard',
    );
  });

  it('builds the root route', () => {
    expect(buildIframeSrc(devServer, '/')).toBe('http://localhost:5173/');
  });

  it('replaces a single :param with the provided value', () => {
    expect(
      buildIframeSrc(devServer, '/users/:id', { id: '42' }),
    ).toBe('http://localhost:5173/users/42');
  });

  it('replaces multiple :params', () => {
    expect(
      buildIframeSrc(devServer, '/org/:orgId/team/:teamId', {
        orgId: 'acme',
        teamId: '7',
      }),
    ).toBe('http://localhost:5173/org/acme/team/7');
  });

  it('defaults missing params to "1"', () => {
    expect(buildIframeSrc(devServer, '/users/:id')).toBe(
      'http://localhost:5173/users/1',
    );
  });

  it('defaults partially missing params to "1"', () => {
    expect(
      buildIframeSrc(devServer, '/org/:orgId/team/:teamId', { orgId: 'acme' }),
    ).toBe('http://localhost:5173/org/acme/team/1');
  });

  it('passes through routes with no params even when urlParams given', () => {
    expect(
      buildIframeSrc(devServer, '/about', { id: '99' }),
    ).toBe('http://localhost:5173/about');
  });

  it('handles empty urlParams object like undefined', () => {
    expect(buildIframeSrc(devServer, '/users/:id', {})).toBe(
      'http://localhost:5173/users/1',
    );
  });
});
