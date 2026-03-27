import { useState, useCallback, useEffect, useRef } from 'react';
import type { DevToolsNodeState, DevToolsConsoleEntry, DevToolsNetworkEntry } from '../types';

const MAX_CONSOLE_ENTRIES = 200;
const MAX_NETWORK_ENTRIES = 100;

export function useDevToolsStore(routeToNodeId: Record<string, string>) {
  const stateRef = useRef<Map<string, DevToolsNodeState>>(new Map());
  const [revision, setRevision] = useState(0); // force re-render trigger
  const routeMapRef = useRef(routeToNodeId);
  routeMapRef.current = routeToNodeId;

  const getOrCreate = useCallback((nodeId: string): DevToolsNodeState => {
    let state = stateRef.current.get(nodeId);
    if (!state) {
      state = { console: [], network: [], storage: null };
      stateRef.current.set(nodeId, state);
    }
    return state;
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg.type !== 'string' || !msg.type.startsWith('fc-devtools-')) return;

      const route = msg.route;
      const nodeId = routeMapRef.current[route];
      if (!nodeId) return;

      const state = getOrCreate(nodeId);

      if (msg.type === 'fc-devtools-console') {
        const entry: DevToolsConsoleEntry = {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          level: msg.level,
          args: msg.args,
          timestamp: msg.timestamp,
        };
        state.console = [...state.console.slice(-MAX_CONSOLE_ENTRIES + 1), entry];
        setRevision(r => r + 1);
      }

      if (msg.type === 'fc-devtools-network') {
        if (msg.phase === 'request') {
          const entry: DevToolsNetworkEntry = {
            id: msg.id,
            method: msg.method,
            url: msg.url,
            requestBody: msg.requestBody,
            startTime: Date.now(),
            completed: false,
          };
          state.network = [...state.network.slice(-MAX_NETWORK_ENTRIES + 1), entry];
        } else {
          // Update existing entry
          state.network = state.network.map(e => {
            if (e.id !== msg.id) return e;
            return {
              ...e,
              status: msg.status,
              statusText: msg.statusText,
              duration: msg.duration,
              size: msg.size,
              responseBody: msg.responseBody,
              error: msg.error,
              completed: true,
            };
          });
        }
        setRevision(r => r + 1);
      }

      if (msg.type === 'fc-devtools-storage') {
        state.storage = {
          localStorage: msg.localStorage,
          sessionStorage: msg.sessionStorage,
          cookies: msg.cookies,
          capturedAt: Date.now(),
        };
        setRevision(r => r + 1);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [getOrCreate]);

  const getStateForNode = useCallback((nodeId: string): DevToolsNodeState => {
    return stateRef.current.get(nodeId) ?? { console: [], network: [], storage: null };
  }, [revision]); // revision in deps forces recalc

  const clearConsole = useCallback((nodeId: string) => {
    const state = stateRef.current.get(nodeId);
    if (state) {
      state.console = [];
      setRevision(r => r + 1);
    }
  }, []);

  const clearNetwork = useCallback((nodeId: string) => {
    const state = stateRef.current.get(nodeId);
    if (state) {
      state.network = [];
      setRevision(r => r + 1);
    }
  }, []);

  const requestStorage = useCallback((iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: 'fc-devtools-request-storage' }, '*');
  }, []);

  return { getStateForNode, clearConsole, clearNetwork, requestStorage };
}
