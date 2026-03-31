import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPinToIframe } from '../lib/pinBridge';
import type { PinnedState } from '../types';

describe('sendPinToIframe', () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let iframe: HTMLIFrameElement;

  beforeEach(() => {
    postMessage = vi.fn();
    iframe = document.createElement('iframe');
    // Mock contentWindow since jsdom iframes don't have real ones
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage },
      writable: true,
    });
  });

  it('sends fc-pin-state message with pin payload', () => {
    const pin: PinnedState = { urlParams: { id: '42' } };
    sendPinToIframe(iframe, pin);

    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledWith(
      { type: 'fc-pin-state', payload: pin },
      '*',
    );
  });

  it('sends auth in the payload', () => {
    const pin: PinnedState = {
      auth: { isLoggedIn: true, username: 'alice', role: 'admin' },
    };
    sendPinToIframe(iframe, pin);

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'fc-pin-state', payload: pin },
      '*',
    );
  });

  it('handles empty pin state', () => {
    sendPinToIframe(iframe, {});
    expect(postMessage).toHaveBeenCalledWith(
      { type: 'fc-pin-state', payload: {} },
      '*',
    );
  });

  it('does not throw if contentWindow is null', () => {
    Object.defineProperty(iframe, 'contentWindow', { value: null });
    expect(() => sendPinToIframe(iframe, {})).not.toThrow();
  });
});
