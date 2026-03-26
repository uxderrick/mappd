import { useState, useCallback } from 'react';
import type { PinnedState, PinnedAuth } from '../types';

export function usePinnedState() {
  // Global auth — applies to ALL nodes
  const [globalAuth, setGlobalAuth] = useState<PinnedAuth | undefined>(undefined);

  // Per-node pins — URL params only
  const [pins, setPins] = useState<Map<string, PinnedState>>(new Map());

  const setAuth = useCallback((auth: PinnedAuth | undefined) => {
    setGlobalAuth(auth);
  }, []);

  const setPinForNode = useCallback((nodeId: string, patch: Partial<PinnedState>) => {
    setPins((prev) => {
      const next = new Map(prev);
      const existing = next.get(nodeId) ?? {};
      // Auth is handled globally now — strip it from per-node pins
      const { auth: _, ...rest } = patch;
      next.set(nodeId, { ...existing, ...rest });
      return next;
    });
  }, []);

  const clearPinForNode = useCallback((nodeId: string) => {
    setPins((prev) => {
      const next = new Map(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  const getPinForNode = useCallback(
    (nodeId: string): PinnedState | undefined => {
      const nodePins = pins.get(nodeId);
      // Merge global auth into the pin for this node
      return {
        ...nodePins,
        auth: globalAuth,
      };
    },
    [pins, globalAuth]
  );

  const hasPinForNode = useCallback(
    (nodeId: string): boolean => {
      const pin = pins.get(nodeId);
      const hasParams = pin?.urlParams && Object.keys(pin.urlParams).length > 0;
      return !!hasParams;
    },
    [pins]
  );

  const hasGlobalAuth = useCallback(
    (): boolean => globalAuth !== undefined,
    [globalAuth]
  );

  return {
    globalAuth,
    setAuth,
    setPinForNode,
    clearPinForNode,
    getPinForNode,
    hasPinForNode,
    hasGlobalAuth,
  };
}
