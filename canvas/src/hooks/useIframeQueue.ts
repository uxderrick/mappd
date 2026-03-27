import { useState, useCallback, useRef } from 'react';

const MAX_CONCURRENT = 4;

/**
 * Manages a queue of iframes to load with a concurrency limit.
 * Prevents overwhelming the target dev server with too many simultaneous requests.
 */
export function useIframeQueue() {
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [, setLoadingIds] = useState<Set<string>>(new Set());
  const queueRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  const processQueue = useCallback(() => {
    while (
      loadingRef.current.size < MAX_CONCURRENT &&
      queueRef.current.length > 0
    ) {
      const nextId = queueRef.current.shift()!;
      loadingRef.current.add(nextId);
      setLoadingIds(new Set(loadingRef.current));
    }
  }, []);

  const requestLoad = useCallback(
    (nodeId: string) => {
      if (loadedIds.has(nodeId) || loadingRef.current.has(nodeId)) return;
      if (queueRef.current.includes(nodeId)) return;
      queueRef.current.push(nodeId);
      processQueue();
    },
    [loadedIds, processQueue]
  );

  const onLoaded = useCallback(
    (nodeId: string) => {
      loadingRef.current.delete(nodeId);
      setLoadingIds(new Set(loadingRef.current));
      setLoadedIds((prev) => new Set(prev).add(nodeId));
      processQueue();
    },
    [processQueue]
  );

  const shouldLoad = useCallback(
    (nodeId: string) => {
      return loadedIds.has(nodeId) || loadingRef.current.has(nodeId);
    },
    [loadedIds]
  );

  return { requestLoad, onLoaded, shouldLoad };
}
