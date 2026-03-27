// Global registry of iframe refs by node ID.
// ScreenNode registers on mount, unregisters on unmount.
// ControlPanel reads the active node's ref for DevTools.

const registry = new Map<string, HTMLIFrameElement>();

export function registerIframe(nodeId: string, iframe: HTMLIFrameElement) {
  registry.set(nodeId, iframe);
}

export function unregisterIframe(nodeId: string) {
  registry.delete(nodeId);
}

export function getIframe(nodeId: string): HTMLIFrameElement | null {
  return registry.get(nodeId) ?? null;
}
