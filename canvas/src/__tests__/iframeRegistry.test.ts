import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerIframe,
  unregisterIframe,
  getIframe,
} from '../lib/iframeRegistry';

describe('iframeRegistry', () => {
  // Create a minimal iframe-like object for testing
  const makeIframe = () => document.createElement('iframe');

  beforeEach(() => {
    // Clean up any registered iframes between tests
    unregisterIframe('a');
    unregisterIframe('b');
  });

  it('returns null for an unregistered node', () => {
    expect(getIframe('nonexistent')).toBeNull();
  });

  it('registers and retrieves an iframe', () => {
    const iframe = makeIframe();
    registerIframe('a', iframe);
    expect(getIframe('a')).toBe(iframe);
  });

  it('unregisters an iframe', () => {
    const iframe = makeIframe();
    registerIframe('a', iframe);
    unregisterIframe('a');
    expect(getIframe('a')).toBeNull();
  });

  it('handles multiple registrations independently', () => {
    const iframeA = makeIframe();
    const iframeB = makeIframe();
    registerIframe('a', iframeA);
    registerIframe('b', iframeB);
    expect(getIframe('a')).toBe(iframeA);
    expect(getIframe('b')).toBe(iframeB);
  });

  it('overwrites on re-register with same id', () => {
    const iframe1 = makeIframe();
    const iframe2 = makeIframe();
    registerIframe('a', iframe1);
    registerIframe('a', iframe2);
    expect(getIframe('a')).toBe(iframe2);
  });

  it('unregister is safe on nonexistent id', () => {
    expect(() => unregisterIframe('nope')).not.toThrow();
  });
});
