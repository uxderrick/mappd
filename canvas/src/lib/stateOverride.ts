/**
 * Send a state override command to an iframe.
 * The mappd-inject.js script inside the iframe handles this via
 * the React DevTools global hook's overrideHookState.
 */
export function overrideHookState(
  iframe: HTMLIFrameElement,
  hookIndex: number,
  value: string | number | boolean | Record<string, unknown>,
  hookType: 'useState' | 'useReducer' = 'useState',
): void {
  iframe.contentWindow?.postMessage({
    type: 'fc-override-state',
    hookIndex,
    value,
    hookType,
  }, '*');
}

/**
 * For useReducer, the value needs to be the entire state object
 * with the specific field changed.
 * e.g., overrideReducerState(iframe, 0, 'view', 'detailed')
 * sends { type: 'fc-override-state', hookIndex: 0, value: { view: 'detailed' } }
 */
export function overrideReducerState(
  iframe: HTMLIFrameElement,
  hookIndex: number,
  field: string,
  value: string | number | boolean,
): void {
  iframe.contentWindow?.postMessage({
    type: 'fc-override-state',
    hookIndex,
    value: { [field]: value },
    hookType: 'useReducer',
  }, '*');
}
