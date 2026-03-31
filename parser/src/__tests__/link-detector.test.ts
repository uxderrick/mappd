import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { detectLinks } from '../analyzers/link-detector.js';

const FIXTURE = path.join(import.meta.dirname, 'fixtures/links-component.tsx');

describe('Link detector', () => {
  it('detects <Link to="..."> navigation', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const profileLink = links.find((l) => l.targetPath === '/profile');
    expect(profileLink).toBeDefined();
    expect(profileLink?.triggerType).toBe('link');
  });

  it('detects <Link> with dynamic path', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const userLink = links.find((l) => l.targetPath === '/users/42');
    expect(userLink).toBeDefined();
  });

  it('detects <a href="..."> links', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const aboutLink = links.find((l) => l.targetPath === '/about');
    expect(aboutLink).toBeDefined();
    expect(aboutLink?.triggerType).toBe('link');
  });

  it('detects navigate() programmatic navigation', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const settingsNav = links.find((l) => l.targetPath === '/settings');
    expect(settingsNav).toBeDefined();
    expect(settingsNav?.triggerType).toBe('programmatic');
  });

  it('detects <Form action="..."> submission', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const formLinks = links.filter((l) => l.targetPath === '/admin' && l.triggerType === 'programmatic');
    expect(formLinks.length).toBeGreaterThan(0);
  });

  it('detects intent-based form buttons', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    const intentLinks = links.filter((l) => l.labelHint.includes('('));
    // Should have "Form (update)" and "Form (delete)" labels
    const labels = intentLinks.map((l) => l.labelHint);
    expect(labels.some((l) => l.includes('update'))).toBe(true);
    expect(labels.some((l) => l.includes('delete'))).toBe(true);
  });

  it('includes source location for all links', () => {
    const links = detectLinks(FIXTURE, '/dashboard');
    for (const link of links) {
      expect(link.sourceLine).toBeGreaterThan(0);
      expect(link.sourceFilePath).toBe(FIXTURE);
      expect(link.sourceRoutePath).toBe('/dashboard');
    }
  });
});
