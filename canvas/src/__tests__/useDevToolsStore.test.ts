import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDevToolsStore } from '../hooks/useDevToolsStore';

function dispatchDevToolsMessage(data: Record<string, unknown>) {
  window.dispatchEvent(new MessageEvent('message', { data }));
}

describe('useDevToolsStore', () => {
  const routeMap = {
    '/': 'node-home',
    '/dashboard': 'node-dash',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty state for unknown node', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));
    const state = result.current.getStateForNode('nonexistent');
    expect(state.console).toEqual([]);
    expect(state.network).toEqual([]);
    expect(state.storage).toBeNull();
  });

  it('captures console messages', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-console',
        route: '/dashboard',
        level: 'log',
        args: ['hello', 'world'],
        timestamp: 1000,
      });
    });

    const state = result.current.getStateForNode('node-dash');
    expect(state.console).toHaveLength(1);
    expect(state.console[0].level).toBe('log');
    expect(state.console[0].args).toEqual(['hello', 'world']);
  });

  it('captures network request + response phases', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-network',
        route: '/',
        phase: 'request',
        id: 'req-1',
        method: 'GET',
        url: '/api/data',
      });
    });

    let state = result.current.getStateForNode('node-home');
    expect(state.network).toHaveLength(1);
    expect(state.network[0].completed).toBe(false);

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-network',
        route: '/',
        phase: 'response',
        id: 'req-1',
        status: 200,
        statusText: 'OK',
        duration: 150,
        size: 1024,
      });
    });

    state = result.current.getStateForNode('node-home');
    expect(state.network[0].completed).toBe(true);
    expect(state.network[0].status).toBe(200);
    expect(state.network[0].duration).toBe(150);
  });

  it('captures storage snapshots', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-storage',
        route: '/dashboard',
        localStorage: { theme: 'dark' },
        sessionStorage: { token: 'abc' },
        cookies: 'sid=xyz',
      });
    });

    const state = result.current.getStateForNode('node-dash');
    expect(state.storage).not.toBeNull();
    expect(state.storage!.localStorage).toEqual({ theme: 'dark' });
    expect(state.storage!.cookies).toBe('sid=xyz');
  });

  it('clears console entries', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-console',
        route: '/',
        level: 'log',
        args: ['msg'],
        timestamp: 1,
      });
    });

    expect(result.current.getStateForNode('node-home').console).toHaveLength(1);

    act(() => result.current.clearConsole('node-home'));
    expect(result.current.getStateForNode('node-home').console).toHaveLength(0);
  });

  it('clears network entries', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-network',
        route: '/',
        phase: 'request',
        id: 'r1',
        method: 'POST',
        url: '/api/save',
      });
    });

    expect(result.current.getStateForNode('node-home').network).toHaveLength(1);

    act(() => result.current.clearNetwork('node-home'));
    expect(result.current.getStateForNode('node-home').network).toHaveLength(0);
  });

  it('ignores messages for unknown routes', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({
        type: 'fc-devtools-console',
        route: '/unknown',
        level: 'error',
        args: ['oops'],
        timestamp: 1,
      });
    });

    expect(result.current.getStateForNode('node-home').console).toHaveLength(0);
    expect(result.current.getStateForNode('node-dash').console).toHaveLength(0);
  });

  it('ignores non-devtools messages', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      dispatchDevToolsMessage({ type: 'fc-navigate', to: '/' });
      dispatchDevToolsMessage({ type: 'random', data: 123 });
    });

    expect(result.current.getStateForNode('node-home').console).toHaveLength(0);
  });

  it('trims console to MAX_CONSOLE_ENTRIES (200)', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));

    act(() => {
      for (let i = 0; i < 210; i++) {
        dispatchDevToolsMessage({
          type: 'fc-devtools-console',
          route: '/',
          level: 'log',
          args: [`msg-${i}`],
          timestamp: i,
        });
      }
    });

    const state = result.current.getStateForNode('node-home');
    expect(state.console.length).toBeLessThanOrEqual(200);
  });

  it('sends storage request via postMessage', () => {
    const { result } = renderHook(() => useDevToolsStore(routeMap));
    const postMessage = vi.fn();
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage },
    });

    act(() => result.current.requestStorage(iframe));
    expect(postMessage).toHaveBeenCalledWith(
      { type: 'fc-devtools-request-storage' },
      '*',
    );
  });
});
