import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinnedState } from '../hooks/usePinnedState';

describe('usePinnedState', () => {
  it('starts with no global auth', () => {
    const { result } = renderHook(() => usePinnedState());
    expect(result.current.globalAuth).toBeUndefined();
    expect(result.current.hasGlobalAuth()).toBe(false);
  });

  it('sets and clears global auth', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() => result.current.setAuth({ isLoggedIn: true, username: 'alice' }));
    expect(result.current.globalAuth).toEqual({
      isLoggedIn: true,
      username: 'alice',
    });
    expect(result.current.hasGlobalAuth()).toBe(true);

    act(() => result.current.setAuth(undefined));
    expect(result.current.globalAuth).toBeUndefined();
    expect(result.current.hasGlobalAuth()).toBe(false);
  });

  it('sets per-node URL params', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() =>
      result.current.setPinForNode('node-1', {
        urlParams: { id: '42' },
      }),
    );

    const pin = result.current.getPinForNode('node-1');
    expect(pin?.urlParams).toEqual({ id: '42' });
  });

  it('merges global auth into getPinForNode', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() => {
      result.current.setAuth({ isLoggedIn: true, role: 'admin' });
      result.current.setPinForNode('node-1', {
        urlParams: { id: '7' },
      });
    });

    const pin = result.current.getPinForNode('node-1');
    expect(pin?.urlParams).toEqual({ id: '7' });
    expect(pin?.auth).toEqual({ isLoggedIn: true, role: 'admin' });
  });

  it('strips auth from per-node pins (auth is global only)', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() =>
      result.current.setPinForNode('node-1', {
        urlParams: { id: '1' },
        auth: { isLoggedIn: true, username: 'should-be-ignored' },
      }),
    );

    // The per-node pin should not store auth — it comes from global
    expect(result.current.hasPinForNode('node-1')).toBe(true);
    // getPinForNode merges global auth (undefined) so auth is undefined
    const pin = result.current.getPinForNode('node-1');
    expect(pin?.auth).toBeUndefined();
  });

  it('clears pin for a specific node', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() =>
      result.current.setPinForNode('node-1', { urlParams: { id: '1' } }),
    );
    expect(result.current.hasPinForNode('node-1')).toBe(true);

    act(() => result.current.clearPinForNode('node-1'));
    expect(result.current.hasPinForNode('node-1')).toBe(false);
  });

  it('hasPinForNode returns false if no urlParams', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() => result.current.setPinForNode('node-1', {}));
    expect(result.current.hasPinForNode('node-1')).toBe(false);
  });

  it('hasPinForNode returns false for empty urlParams', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() => result.current.setPinForNode('node-1', { urlParams: {} }));
    expect(result.current.hasPinForNode('node-1')).toBe(false);
  });

  it('manages pins for multiple nodes independently', () => {
    const { result } = renderHook(() => usePinnedState());

    act(() => {
      result.current.setPinForNode('a', { urlParams: { id: '1' } });
      result.current.setPinForNode('b', { urlParams: { slug: 'hello' } });
    });

    expect(result.current.getPinForNode('a')?.urlParams).toEqual({ id: '1' });
    expect(result.current.getPinForNode('b')?.urlParams).toEqual({
      slug: 'hello',
    });

    act(() => result.current.clearPinForNode('a'));
    expect(result.current.hasPinForNode('a')).toBe(false);
    expect(result.current.hasPinForNode('b')).toBe(true);
  });
});
