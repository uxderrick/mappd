import { useEffect, useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import type { MappdMessage, ScreenNodeData } from '../types';

function matchDynamicRoute(pathname: string, pattern: string): boolean {
  const pathParts = pathname.split('/');
  const patternParts = pattern.split('/');

  if (pathParts.length !== patternParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith(':')) return true;
    return part === pathParts[i];
  });
}

/**
 * Extract URL param values from an actual path by comparing against a route pattern.
 * e.g., extractParams('/dashboard/users/2', '/dashboard/users/:id') => { id: '2' }
 */
function extractParams(pathname: string, pattern: string): Record<string, string> {
  const pathParts = pathname.split('/');
  const patternParts = pattern.split('/');
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1).replace(/[*?]/g, '');
      params[paramName] = pathParts[i];
    }
  }

  return params;
}

export function useCanvasNavigation(
  nodes: Node<ScreenNodeData>[],
  setActiveNodeId: (id: string | null) => void,
  onDynamicNavigate?: (nodeId: string, urlParams: Record<string, string>) => void,
) {
  const { fitView, getZoom } = useReactFlow();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = event.data as MappdMessage;
      if (!message || message.type !== 'fc-navigate') return;

      const { to, data: messageData } = message;

      // Find target node: exact match first, then dynamic route match
      let targetNode = nodes.find((n) => n.data.routePath === to);
      let isDynamic = false;

      if (!targetNode) {
        targetNode = nodes.find((n) => matchDynamicRoute(to, n.data.routePath));
        isDynamic = !!targetNode;
      }

      if (!targetNode) return;

      setActiveNodeId(targetNode.id);

      // If dynamic route, extract actual param values and update the node's URL params
      if (isDynamic && onDynamicNavigate) {
        const params = extractParams(to, targetNode.data.routePath);
        if (Object.keys(params).length > 0) {
          onDynamicNavigate(targetNode.id, params);
        }
      }

      const currentZoom = getZoom();
      const targetZoom = Math.min(currentZoom, 2.2);

      fitView({
        nodes: [{ id: targetNode.id }],
        duration: 600,
        padding: 0.05,
        maxZoom: targetZoom,
      });

      // Forward data to target iframe if provided
      if (messageData) {
        const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
        for (const iframe of iframes) {
          if (iframe.src.includes(targetNode.data.routePath.replace(/:[\w]+/g, ''))) {
            iframe.contentWindow?.postMessage(
              { type: 'fc-data', data: messageData },
              '*',
            );
            break;
          }
        }
      }
    },
    [nodes, fitView, getZoom, setActiveNodeId, onDynamicNavigate],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);
}
