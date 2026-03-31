import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIframeQueue } from '../hooks/useIframeQueue';

describe('useIframeQueue', () => {
  it('starts with nothing loaded', () => {
    const { result } = renderHook(() => useIframeQueue());
    expect(result.current.shouldLoad('any')).toBe(false);
  });

  it('allows first two requests to load immediately', () => {
    const { result } = renderHook(() => useIframeQueue());

    act(() => {
      result.current.requestLoad('a');
      result.current.requestLoad('b');
    });

    expect(result.current.shouldLoad('a')).toBe(true);
    expect(result.current.shouldLoad('b')).toBe(true);
  });

  it('queues third request until one finishes', () => {
    const { result } = renderHook(() => useIframeQueue());

    act(() => {
      result.current.requestLoad('a');
      result.current.requestLoad('b');
      result.current.requestLoad('c');
    });

    // c should be queued, not loading yet
    expect(result.current.shouldLoad('a')).toBe(true);
    expect(result.current.shouldLoad('b')).toBe(true);
    expect(result.current.shouldLoad('c')).toBe(false);
  });

  it('promotes queued item after one finishes loading', () => {
    const { result } = renderHook(() => useIframeQueue());

    act(() => {
      result.current.requestLoad('a');
      result.current.requestLoad('b');
      result.current.requestLoad('c');
    });

    // Finish loading a
    act(() => result.current.onLoaded('a'));

    // Now c should be promoted to loading
    expect(result.current.shouldLoad('c')).toBe(true);
  });

  it('ignores duplicate requestLoad calls', () => {
    const { result } = renderHook(() => useIframeQueue());

    act(() => {
      result.current.requestLoad('a');
      result.current.requestLoad('a');
      result.current.requestLoad('a');
    });

    expect(result.current.shouldLoad('a')).toBe(true);
  });

  it('does not re-queue already loaded items', () => {
    const { result } = renderHook(() => useIframeQueue());

    act(() => result.current.requestLoad('a'));
    act(() => result.current.onLoaded('a'));

    // Request again — should still show as loadable (already loaded)
    act(() => result.current.requestLoad('a'));
    expect(result.current.shouldLoad('a')).toBe(true);
  });

  it('processes full queue in order', () => {
    const { result } = renderHook(() => useIframeQueue());
    const loaded: string[] = [];

    act(() => {
      result.current.requestLoad('a');
      result.current.requestLoad('b');
      result.current.requestLoad('c');
      result.current.requestLoad('d');
    });

    // a and b are loading
    act(() => {
      result.current.onLoaded('a');
      loaded.push('a');
    });
    // c should now be loading
    expect(result.current.shouldLoad('c')).toBe(true);

    act(() => {
      result.current.onLoaded('b');
      loaded.push('b');
    });
    // d should now be loading
    expect(result.current.shouldLoad('d')).toBe(true);
  });
});
