import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  useViewport,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ScreenNode from './components/ScreenNode';
import ScreenListPanel from './components/ScreenListPanel';
import ControlPanel, { VIEWPORT_PRESETS, type ViewportPreset, type RouteInfo, type CanvasTheme, type EdgeStyle } from './components/ControlPanel';
import { layoutGraph, type LayoutDirection } from './lib/layoutGraph';
import StatusBar from './components/StatusBar';
import { getIframe } from './lib/iframeRegistry';
import { useCanvasNavigation } from './hooks/useCanvasNavigation';
import { useIframeQueue } from './hooks/useIframeQueue';
import { usePinnedState } from './hooks/usePinnedState';
import { useDevToolsStore } from './hooks/useDevToolsStore';
import { buildIframeSrc } from './lib/buildIframeSrc';
import type { ScreenNodeData } from './types';

const nodeTypes: NodeTypes = {
  screenNode: ScreenNode,
};

interface FlowGraphJSON {
  nodes: {
    id: string;
    routePath: string;
    componentName: string;
    componentFilePath: string;
    isIndex: boolean;
    isDynamic: boolean;
    parentLayoutId?: string;
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    triggerType: 'link' | 'programmatic' | 'state';
    triggerLabel: string;
    sourceCodeLocation: { file: string; line: number; column: number };
  }[];
  stateScreens?: {
    parentRoutePath: string;
    parentComponentFile: string;
    name: string;
    hookType: 'useState' | 'useReducer' | 'xstate' | 'zustand';
    hookIndex: number;
    stateValue: string | number | boolean;
    componentName: string;
    confidence: 'high' | 'medium' | 'low';
    sourceLine: number;
    sourceColumn: number;
  }[];
  metadata: {
    projectName: string;
    framework: string;
    generatedAt: string;
    mappdVersion: string;
  };
}

interface BaseNodeData {
  routePath: string;
  componentName: string;
  componentFilePath: string;
  nodeId: string;
  isDynamic: boolean;
  [key: string]: unknown;
}

function adaptGraph(graph: FlowGraphJSON): {
  baseNodes: (Node<BaseNodeData>)[];
  edges: Edge[];
  stateScreens: StateScreenInfo[];
} {
  const baseNodes = graph.nodes.map((n) => ({
    id: n.id,
    type: 'screenNode' as const,
    position: n.position,
    dragHandle: '.drag-handle',
    data: {
      routePath: n.routePath,
      componentName: n.componentName,
      componentFilePath: n.componentFilePath,
      nodeId: n.id,
      isDynamic: n.isDynamic,
    },
  }));

  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    label: e.triggerLabel,
    animated: e.triggerType === 'programmatic',
    style: e.triggerType === 'programmatic' ? { strokeDasharray: '5 5' } : undefined,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { baseNodes, edges, stateScreens: graph.stateScreens ?? [] };
}

export interface StateScreenInfo {
  parentRoutePath: string;
  name: string;
  hookType: string;
  hookIndex: number;
  stateValue: string | number | boolean;
  componentName: string;
  confidence: string;
}

function AppInner() {
  // Prevent ALL native browser zoom — Figma does the same
  useEffect(() => {
    // Pinch-to-zoom fires as wheel with ctrlKey
    const preventWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    // macOS trackpad gesture events
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };
    // Cmd/Ctrl +/-/0 keyboard zoom
    const preventKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false } as any);
    document.addEventListener('gesturechange', preventGesture, { passive: false } as any);
    document.addEventListener('gestureend', preventGesture, { passive: false } as any);
    document.addEventListener('keydown', preventKeyZoom);

    // Set viewport meta to prevent mobile/touch zoom
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

    return () => {
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('keydown', preventKeyZoom);
    };
  }, []);

  const activeIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for state override results from iframes
  const [config, setConfig] = useState<{ targetPort: number; wsPort: number } | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ baseNodes: Node<BaseNodeData>[]; edges: Edge[]; stateScreens: StateScreenInfo[]; framework?: string } | null>(null);
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [viewportPreset, setViewportPreset] = useState<ViewportPreset>('desktop');
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>('dark');
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('LR');
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>('solid');
  const [liveOverrides, setLiveOverrides] = useState<Record<string, boolean>>({});
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});
  const [hugContent, setHugContent] = useState(false);

  // Listen for state override results from iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'fc-override-state-result') {
        if (e.data.success) {
          console.log('[Mappd] State override succeeded:', e.data);
        } else {
          console.warn('[Mappd] State override failed:', e.data.error);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const { zoom } = useViewport();
  const { fitView } = useReactFlow();
  const { requestLoad, onLoaded, shouldLoad } = useIframeQueue();
  const { globalAuth, setAuth, setPinForNode, clearPinForNode, getPinForNode, hasPinForNode } = usePinnedState();

  // DevTools: build route→nodeId map for message attribution
  // Build route→nodeId map for DevTools message attribution
  // Also map resolved dynamic paths (e.g., /users/1 → users-id node)
  const routeToNodeId = useMemo(() => {
    const map: Record<string, string> = {};
    const dynamicPatterns: { pattern: string; nodeId: string }[] = [];

    for (const n of (graphData?.baseNodes ?? [])) {
      map[n.data.routePath] = n.id;

      // Track dynamic route patterns for fallback matching
      if (n.data.isDynamic) {
        dynamicPatterns.push({ pattern: n.data.routePath, nodeId: n.id });
      }

      // Map resolved paths with pinned params
      const pin = getPinForNode(n.id);
      if (pin?.urlParams) {
        let resolved = n.data.routePath;
        for (const [k, v] of Object.entries(pin.urlParams)) {
          resolved = resolved.replace(`:${k}`, v);
        }
        if (resolved !== n.data.routePath) map[resolved] = n.id;
      }

      // Map default resolved paths (replace :param with 1)
      if (n.data.isDynamic) {
        const defaultResolved = n.data.routePath.replace(/:(\w+)/g, '1');
        map[defaultResolved] = n.id;
      }
    }

    // Store patterns for dynamic matching (used by the store hook)
    (map as any).__dynamicPatterns = dynamicPatterns;
    return map;
  }, [graphData, getPinForNode]);

  const { getStateForNode, clearConsole, clearNetwork, requestStorage } = useDevToolsStore(routeToNodeId);

  // Fetch config from CLI server; fall back to defaults in standalone dev mode
  useEffect(() => {
    fetch('/mappd-config.json')
      .then(res => res.ok ? res.json() : null)
      .then(cfg => setConfig(cfg ?? { targetPort: 5173, wsPort: 4200 }))
      .catch(() => setConfig({ targetPort: 5173, wsPort: 4200 }));
  }, []);

  const devServerUrl = config ? `http://localhost:${config.targetPort}` : 'http://localhost:5173';

  // Fetch the parsed flow graph
  useEffect(() => {
    fetch('/flow-graph.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load flow graph: ${res.status}`);
        return res.json();
      })
      .then((graph: FlowGraphJSON) => {
        setGraphData({ ...adaptGraph(graph), framework: graph.metadata?.framework });
      })
      .catch((err) => {
        setError(err.message);
      });

    fetch('/screenshots.json')
      .then((res) => (res.ok ? res.json() : {}))
      .then((manifest: Record<string, string>) => setScreenshots(manifest))
      .catch(() => {});
  }, []);

  const baseNodes = graphData?.baseNodes ?? [];
  const baseEdges = graphData?.edges ?? [];

  // Auto-load the index route on first load (but don't select it)
  useEffect(() => {
    if (!graphData) return;
    const indexNode = baseNodes.find((n) => n.data.routePath === '/') ?? baseNodes[0];
    if (indexNode) {
      requestLoad(indexNode.id);
    }
  }, [graphData, baseNodes, requestLoad]);

  // When zoom crosses threshold, request loading for visible nodes
  useEffect(() => {
    if (zoom > 0.3) {
      baseNodes.forEach((node) => requestLoad(node.id));
    }
  }, [zoom, baseNodes, requestLoad]);

  const handleRequestLoad = useCallback(
    (nodeId: string) => requestLoad(nodeId),
    [requestLoad]
  );

  const handleIframeLoaded = useCallback(
    (nodeId: string) => onLoaded(nodeId),
    [onLoaded]
  );

  const handleDoubleClickNode = useCallback((nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.3, maxZoom: 1.5 });
  }, [fitView]);

  // v1.1 handlers
  const handleToggleEdges = useCallback(() => setShowEdges((v) => !v), []);
  const handleToggleLabels = useCallback(() => setShowLabels((v) => !v), []);

  const vpDims = VIEWPORT_PRESETS[viewportPreset];
  // Actual rendered node height: iframe height scaled to 480px width + label padding
  const nodeHeight = Math.round(vpDims.height * (480 / vpDims.width)) + 30;

  // Auto re-layout when viewport preset changes (node heights change, prevents overlap)
  const prevViewportRef = useRef(viewportPreset);
  useEffect(() => {
    if (prevViewportRef.current === viewportPreset) return;
    prevViewportRef.current = viewportPreset;
    setGraphData((prev) => {
      if (!prev || prev.baseNodes.length === 0) return prev;
      try {
        const relaid = layoutGraph(prev.baseNodes, prev.edges, layoutDirection, nodeHeight);
        if (relaid.length === 0) return prev;
        return { ...prev, baseNodes: relaid };
      } catch {
        return prev;
      }
    });
  }, [viewportPreset, layoutDirection, nodeHeight]);

  const handleReLayout = useCallback(() => {
    setGraphData((prev) => {
      if (!prev || prev.baseNodes.length === 0) return prev;
      try {
        const relaid = layoutGraph(prev.baseNodes, prev.edges, layoutDirection, nodeHeight);
        if (relaid.length === 0) return prev;
        return { ...prev, baseNodes: relaid };
      } catch {
        return prev;
      }
    });
  }, [layoutDirection, nodeHeight]);

  const handleLayoutDirectionChange = useCallback((dir: LayoutDirection) => {
    setLayoutDirection(dir);
  }, []);

  const handleReloadScreen = useCallback((nodeId: string) => {
    setReloadKeys((prev) => ({ ...prev, [nodeId]: (prev[nodeId] ?? 0) + 1 }));
  }, []);

  const handleToggleLive = useCallback((nodeId: string) => {
    setLiveOverrides((prev) => ({ ...prev, [nodeId]: prev[nodeId] === false ? true : false }));
  }, []);

  // Route info list for control panel
  const routeInfoList: RouteInfo[] = useMemo(
    () => baseNodes.map((n) => ({
      id: n.id,
      routePath: n.data.routePath,
      componentName: n.data.componentName,
      componentFilePath: n.data.componentFilePath,
    })),
    [baseNodes]
  );

  // Stabilize zoom — only recalculate nodes when crossing the threshold, not on every scroll
  const zoomAboveThreshold = zoom > 0.3;

  // Build nodes with pinned state and computed iframeSrc
  const nodes: Node<ScreenNodeData>[] = useMemo(
    () =>
      baseNodes.map((node) => {
        const pin = getPinForNode(node.id);
        const iframeSrc = buildIframeSrc(
          devServerUrl,
          node.data.routePath,
          pin?.urlParams,
        );

        return {
          ...node,
          data: {
            routePath: node.data.routePath,
            componentName: node.data.componentName,
            nodeId: node.data.nodeId,
            iframeSrc,
            isActive: node.id === activeNodeId,
            screenshotUrl: screenshots[node.id] || undefined,
            zoomLevel: zoom > 0.3 ? 1 : 0, // Stabilized — only changes at threshold
            canGoLive: true, // Always allow — queue manages concurrency internally
            pinnedState: pin,
            hasPinnedState: hasPinForNode(node.id),
            viewportWidth: vpDims.width,
            viewportHeight: vpDims.height,
            forceLive: liveOverrides[node.id],
            reloadKey: reloadKeys[node.id] ?? 0,
            hideLabel: !showLabels,
            hugContent,
            onDoubleClick: handleDoubleClickNode,
            onRequestLoad: handleRequestLoad,
            onIframeLoaded: handleIframeLoaded,
            // DevTools state intentionally excluded from node data to prevent
            // re-renders that would remount iframes. The right panel reads
            // DevTools state directly via getStateForNode(activeNodeId).
          },
        };
      }),
    [activeNodeId, baseNodes, screenshots, zoomAboveThreshold, devServerUrl, getPinForNode, hasPinForNode, handleRequestLoad, handleIframeLoaded, handleDoubleClickNode, vpDims, liveOverrides, reloadKeys, showLabels, hugContent]
  );

  const edges = useMemo(
    () => {
      if (!showEdges) return [];
      return baseEdges.map((edge) => {
        const isConnected =
          activeNodeId !== null &&
          (edge.source === activeNodeId || edge.target === activeNodeId);

        const baseStyle: Record<string, unknown> = {
          ...edge.style,
          stroke: isConnected ? '#a78bfa' : undefined,
          strokeWidth: isConnected ? 2 : undefined,
          opacity: isConnected ? 1 : undefined,
        };

        if (edgeStyle === 'dashed') {
          baseStyle.strokeDasharray = '5 5';
        }

        return {
          ...edge,
          style: baseStyle,
          animated: edgeStyle === 'animated' || (isConnected ? true : edge.animated),
          label: showLabels ? edge.label : undefined,
          labelStyle: isConnected ? { fill: 'rgba(255,255,255,0.9)' } : undefined,
          labelBgStyle: isConnected
            ? { fill: '#a78bfa', fillOpacity: 1 }
            : undefined,
        };
      });
    },
    [activeNodeId, baseEdges, showEdges, edgeStyle, showLabels]
  );

  // When navigating to a dynamic route, auto-pin the extracted URL params
  const handleDynamicNavigate = useCallback(
    (nodeId: string, urlParams: Record<string, string>) => {
      setPinForNode(nodeId, { urlParams });
    },
    [setPinForNode]
  );

  useCanvasNavigation(nodes, setActiveNodeId, handleDynamicNavigate);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setActiveNodeId(null);
  }, []);

  if (error) {
    return (
      <div style={{ color: '#ef4444', padding: 40, fontFamily: "'SF Mono', 'JetBrains Mono', monospace", background: '#09090b', height: '100%' }}>
        <h2 style={{ color: '#e4e4e7', fontWeight: 500, fontSize: 16 }}>Mappd Error</h2>
        <p style={{ fontSize: 13, marginTop: 8 }}>{error}</p>
        <p style={{ color: '#52525b', marginTop: 16, fontSize: 12 }}>
          Run the parser first: <code style={{ color: '#a78bfa' }}>cd parser && npm test</code>
        </p>
      </div>
    );
  }

  if (!config || !graphData) {
    return (
      <div style={{ color: '#52525b', padding: 40, fontFamily: "'SF Mono', 'JetBrains Mono', monospace", background: '#09090b', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
        Loading flow graph...
      </div>
    );
  }

  // Update active iframe ref from registry
  activeIframeRef.current = activeNodeId ? getIframe(activeNodeId) : null;

  return (
    <div className="fc-layout">
      {/* Left panel — screen list */}
      <ScreenListPanel
        screens={routeInfoList}
        activeNodeId={activeNodeId}
        onSelect={setActiveNodeId}
      />

      {/* Center — canvas */}
      <div className="fc-layout-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          panOnScroll
          panOnScrollSpeed={1.5}
          zoomOnScroll={false}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={4}
          className={canvasTheme === 'light' ? 'fc-theme-light' : ''}
        >
          <MiniMap
            nodeColor="#a78bfa"
            maskColor={canvasTheme === 'light' ? 'rgba(228,228,232,0.75)' : 'rgba(9, 9, 11, 0.75)'}
            style={{ backgroundColor: canvasTheme === 'light' ? '#d4d4d8' : '#141416' }}
          />
          <Controls />
          <Background
            variant={BackgroundVariant.Dots}
            color={canvasTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'}
            gap={24}
          />
        </ReactFlow>
      </div>

      {/* Right panel — controls + node properties */}
      <ControlPanel
        routes={routeInfoList}
        activeNodeId={activeNodeId}
        devServerUrl={devServerUrl}
        onViewportChange={setViewportPreset}
        currentViewport={viewportPreset}
        canvasTheme={canvasTheme}
        onThemeChange={setCanvasTheme}
        showEdges={showEdges}
        onToggleEdges={handleToggleEdges}
        showLabels={showLabels}
        onToggleLabels={handleToggleLabels}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={handleLayoutDirectionChange}
        onReLayout={handleReLayout}
        edgeStyle={edgeStyle}
        onEdgeStyleChange={setEdgeStyle}
        onReloadScreen={handleReloadScreen}
        onToggleLive={handleToggleLive}
        liveOverrides={liveOverrides}
        hugContent={hugContent}
        onToggleHugContent={() => setHugContent((v) => !v)}
        pinnedState={activeNodeId ? getPinForNode(activeNodeId) : undefined}
        globalAuth={globalAuth}
        onUpdatePin={setPinForNode}
        onClearPin={clearPinForNode}
        onUpdateAuth={setAuth}
        devToolsState={activeNodeId ? getStateForNode(activeNodeId) : undefined}
        onClearConsole={clearConsole}
        onClearNetwork={clearNetwork}
        onRequestStorage={requestStorage}
        activeIframeRef={activeIframeRef}
        stateScreens={activeNodeId ? (graphData?.stateScreens ?? []).filter(
          s => {
            // Match state screens to the active node's route
            const activeNode = baseNodes.find(n => n.id === activeNodeId);
            return activeNode && s.parentRoutePath === activeNode.data.routePath;
          }
        ) : []}
        onOverrideState={(hookIndex, value, _componentName, hookType) => {
          const iframe = activeNodeId ? getIframe(activeNodeId) : null;
          const activeNode = baseNodes.find(n => n.id === activeNodeId);
          const realComponentName = activeNode?.data.componentName;
          if (iframe) {
            console.log('[Mappd] Sending state override:', { hookIndex, value, hookType, componentName: realComponentName, nodeId: activeNodeId });
            iframe.contentWindow?.postMessage({
              type: 'fc-override-state',
              hookIndex,
              value,
              componentName: realComponentName,
              hookType,
            }, '*');
          } else {
            console.warn('[Mappd] No iframe found for active node:', activeNodeId);
          }
        }}
      />

      {/* Status bar — bottom */}
      <StatusBar
        screenCount={baseNodes.length}
        connectionCount={baseEdges.length}
        devServerUrl={devServerUrl}
        framework={graphData?.framework}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
