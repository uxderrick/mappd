import { describe, it, expect, vi, beforeEach } from 'vitest';
import { overrideHookState, overrideReducerState } from '../lib/stateOverride';

describe('stateOverride', () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let iframe: HTMLIFrameElement;

  beforeEach(() => {
    postMessage = vi.fn();
    iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage },
      writable: true,
    });
  });

  describe('overrideHookState', () => {
    it('sends fc-override-state with useState by default', () => {
      overrideHookState(iframe, 0, 'hello');
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'fc-override-state',
          hookIndex: 0,
          value: 'hello',
          hookType: 'useState',
        },
        '*',
      );
    });

    it('sends with explicit useReducer hookType', () => {
      overrideHookState(iframe, 2, { count: 5 }, 'useReducer');
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'fc-override-state',
          hookIndex: 2,
          value: { count: 5 },
          hookType: 'useReducer',
        },
        '*',
      );
    });

    it('handles boolean values', () => {
      overrideHookState(iframe, 1, true);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ value: true, hookIndex: 1 }),
        '*',
      );
    });

    it('does not throw if contentWindow is null', () => {
      Object.defineProperty(iframe, 'contentWindow', { value: null });
      expect(() => overrideHookState(iframe, 0, 'val')).not.toThrow();
    });
  });

  describe('overrideReducerState', () => {
    it('wraps field/value into an object with useReducer hookType', () => {
      overrideReducerState(iframe, 0, 'view', 'detailed');
      expect(postMessage).toHaveBeenCalledWith(
        {
          type: 'fc-override-state',
          hookIndex: 0,
          value: { view: 'detailed' },
          hookType: 'useReducer',
        },
        '*',
      );
    });

    it('handles numeric values', () => {
      overrideReducerState(iframe, 1, 'count', 42);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ value: { count: 42 } }),
        '*',
      );
    });
  });
});
