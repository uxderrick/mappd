export function isFlowCanvasMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('flowcanvas') === 'true';
}

function closestAnchor(el: EventTarget | null): HTMLAnchorElement | null {
  if (!(el instanceof HTMLElement)) return null;
  return el.closest('a');
}

function isInternalHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function setupFlowCanvasInterception(): void {
  // Intercept link clicks in capture phase to beat React Router
  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const anchor = closestAnchor(e.target);
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !isInternalHref(href)) return;

      const url = new URL(href, window.location.origin);
      e.preventDefault();
      e.stopPropagation();

      window.parent.postMessage(
        { type: 'fc-navigate', from: window.location.pathname, to: url.pathname },
        '*'
      );
    },
    true
  );

  // Don't intercept form submissions globally — React components
  // handle their own submissions via useFlowCanvasNavigate() which
  // sends the correct postMessage with the right destination path.

  // Forward wheel events to parent so canvas zoom works over iframes
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      window.parent.postMessage(
        {
          type: 'fc-wheel',
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        },
        '*'
      );
    },
    { passive: true }
  );

  // Listen for data forwarded from parent canvas
  window.addEventListener('message', (e: MessageEvent) => {
    if (e.data && e.data.type === 'fc-data') {
      (window as any).__fcData = e.data.payload;
      window.dispatchEvent(new CustomEvent('fc-data', { detail: e.data.payload }));
    }
  });
}

export function flowCanvasNavigate(to: string, data?: Record<string, unknown>): void {
  window.parent.postMessage(
    { type: 'fc-navigate', from: window.location.pathname, to, ...(data ? { data } : {}) },
    '*'
  );
}
