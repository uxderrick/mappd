import type { PinnedState } from '../types';

/**
 * Send pinned state to an iframe via postMessage.
 * The iframe's mappd-inject.js script handles the fc-pin-state message.
 */
export function sendPinToIframe(iframe: HTMLIFrameElement, pin: PinnedState): void {
  iframe.contentWindow?.postMessage(
    { type: 'fc-pin-state', payload: pin },
    '*'
  );
}
