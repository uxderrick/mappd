import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  useViewport,
  ReactFlowProvider,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ScreenNode from './components/ScreenNode';
import PinPanel from './components/PinPanel';
import { useCanvasNavigation } from './hooks/useCanvasNavigation';
import { useIframeQueue } from './hooks/useIframeQueue';
import { usePinnedState } from './hooks/usePinnedState';
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
  nodeId: string;
  isDynamic: boolean;
  [key: string]: unknown;
}

function adaptGraph(graph: FlowGraphJSON): {
  baseNodes: (Node<BaseNodeData>)[];
  edges: Edge[];
} {
  const baseNodes = graph.nodes.map((n) => ({
    id: n.id,
    type: 'screenNode' as const,
    position: n.position,
    dragHandle: '.drag-handle',
    data: {
      routePath: n.routePath,
      componentName: n.componentName,
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

  return { baseNodes, edges };
}

function AppInner() {
  const [config, setConfig] = useState<{ targetPort: number; wsPort: number } | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [pinPanelNodeId, setPinPanelNodeId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ baseNodes: Node<BaseNodeData>[]; edges: Edge[] } | null>(null);
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { zoom } = useViewport();
  const { requestLoad, onLoaded, shouldLoad } = useIframeQueue();
  const { globalAuth, setAuth, setPinForNode, clearPinForNode, getPinForNode, hasPinForNode } = usePinnedState();

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
        setGraphData(adaptGraph(graph));
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

  // Auto-activate the index route (/) on first load
  useEffect(() => {
    if (!graphData || activeNodeId) return;
    const indexNode = baseNodes.find((n) => n.data.routePath === '/') ?? baseNodes[0];
    if (indexNode) {
      setActiveNodeId(indexNode.id);
      requestLoad(indexNode.id);
    }
  }, [graphData, baseNodes, activeNodeId, requestLoad]);

  // When zoom crosses threshold, request loading for visible nodes
  useEffect(() => {
    if (zoom > 1.0) {
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

  const handleOpenPinEditor = useCallback((nodeId: string) => {
    setPinPanelNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleClosePinPanel = useCallback(() => {
    setPinPanelNodeId(null);
  }, []);

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
            zoomLevel: zoom,
            canGoLive: shouldLoad(node.id),
            pinnedState: pin,
            hasPinnedState: hasPinForNode(node.id),
            onRequestLoad: handleRequestLoad,
            onIframeLoaded: handleIframeLoaded,
            onOpenPinEditor: handleOpenPinEditor,
          },
        };
      }),
    [activeNodeId, baseNodes, screenshots, zoom, devServerUrl, shouldLoad, getPinForNode, hasPinForNode, handleRequestLoad, handleIframeLoaded, handleOpenPinEditor]
  );

  const edges = useMemo(
    () =>
      baseEdges.map((edge) => {
        const isConnected =
          activeNodeId !== null &&
          (edge.source === activeNodeId || edge.target === activeNodeId);
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: isConnected ? '#a78bfa' : undefined,
            strokeWidth: isConnected ? 2 : undefined,
            opacity: isConnected ? 1 : undefined,
          },
          animated: isConnected ? true : edge.animated,
          labelStyle: isConnected ? { fill: 'rgba(255,255,255,0.9)' } : undefined,
          labelBgStyle: isConnected
            ? { fill: '#a78bfa', fillOpacity: 1 }
            : undefined,
        };
      }),
    [activeNodeId, baseEdges]
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

  // Find the node data for the pin panel
  const pinPanelNode = pinPanelNodeId
    ? baseNodes.find((n) => n.id === pinPanelNodeId)
    : null;

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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        panOnScroll
        panOnScrollSpeed={1.5}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={4}
      >
        <MiniMap
          nodeColor="#a78bfa"
          maskColor="rgba(9, 9, 11, 0.75)"
          style={{ backgroundColor: '#141416' }}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.06)" gap={24} />
      </ReactFlow>

      {/* Pin Panel — slides in from right */}
      {pinPanelNode && (
        <PinPanel
          nodeId={pinPanelNode.id}
          routePath={pinPanelNode.data.routePath}
          componentName={pinPanelNode.data.componentName}
          pinnedState={getPinForNode(pinPanelNode.id)}
          globalAuth={globalAuth}
          onUpdateNode={setPinForNode}
          onClearNode={clearPinForNode}
          onUpdateAuth={setAuth}
          onClose={handleClosePinPanel}
        />
      )}
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
