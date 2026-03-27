import { useState, useCallback, useEffect } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { toPng } from 'html-to-image';
import type { LayoutDirection } from '../lib/layoutGraph';
import type { PinnedState, PinnedAuth, DevToolsNodeState } from '../types';
import type { StateScreenInfo } from '../App';
import DevToolsPanel from './DevToolsPanel';

interface RouteInfo {
  id: string;
  routePath: string;
  componentName: string;
  componentFilePath?: string;
}

type ViewportPreset = 'desktop' | 'tablet' | 'mobile';
type CanvasTheme = 'dark' | 'light';
type EdgeStyle = 'solid' | 'dashed' | 'animated';

const VIEWPORT_PRESETS: Record<ViewportPreset, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 667, label: 'Mobile' },
};

interface ControlPanelProps {
  routes: RouteInfo[];
  activeNodeId: string | null;
  devServerUrl: string;
  onViewportChange: (preset: ViewportPreset) => void;
  currentViewport: ViewportPreset;
  canvasTheme: CanvasTheme;
  onThemeChange: (theme: CanvasTheme) => void;
  showEdges: boolean;
  onToggleEdges: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  layoutDirection: LayoutDirection;
  onLayoutDirectionChange: (dir: LayoutDirection) => void;
  onReLayout: () => void;
  edgeStyle: EdgeStyle;
  onEdgeStyleChange: (style: EdgeStyle) => void;
  onReloadScreen: (nodeId: string) => void;
  onToggleLive: (nodeId: string) => void;
  liveOverrides: Record<string, boolean>;
  // Pin state
  pinnedState?: PinnedState;
  globalAuth?: PinnedAuth;
  onUpdatePin: (nodeId: string, pin: Partial<PinnedState>) => void;
  onClearPin: (nodeId: string) => void;
  onUpdateAuth: (auth: PinnedAuth | undefined) => void;
  // DevTools
  devToolsState?: DevToolsNodeState;
  onClearConsole: (nodeId: string) => void;
  onClearNetwork: (nodeId: string) => void;
  onRequestStorage: (iframe: HTMLIFrameElement) => void;
  activeIframeRef: React.RefObject<HTMLIFrameElement | null>;
  // State screens
  stateScreens?: StateScreenInfo[];
  onOverrideState?: (hookIndex: number, value: string | number | boolean | Record<string, unknown>) => void;
}

export default function ControlPanel({
  routes,
  activeNodeId,
  devServerUrl,
  onViewportChange,
  currentViewport,
  canvasTheme,
  onThemeChange,
  showEdges,
  onToggleEdges,
  showLabels,
  onToggleLabels,
  layoutDirection,
  onLayoutDirectionChange,
  onReLayout,
  edgeStyle,
  onEdgeStyleChange,
  onReloadScreen,
  onToggleLive,
  liveOverrides,
  pinnedState,
  globalAuth,
  onUpdatePin,
  onClearPin,
  onUpdateAuth,
  devToolsState,
  onClearConsole,
  onClearNetwork,
  onRequestStorage,
  activeIframeRef,
  stateScreens,
  onOverrideState,
}: ControlPanelProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    zoom: true,
    viewport: true,
    display: true,
    layout: true,
    export: false,
  });
  const toggleSection = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Pin state local mirrors
  const activeRoute = routes.find((r) => r.id === activeNodeId);
  const paramNames = activeRoute
    ? (activeRoute.routePath.match(/:(\w+)/g) || []).map((p) => p.slice(1))
    : [];

  const [urlParams, setUrlParams] = useState<Record<string, string>>(
    pinnedState?.urlParams ?? {}
  );
  const [auth, setAuth] = useState<PinnedAuth>(
    globalAuth ?? { isLoggedIn: false }
  );
  const [authEnabled, setAuthEnabled] = useState(!!globalAuth);

  useEffect(() => {
    setUrlParams(pinnedState?.urlParams ?? {});
  }, [activeNodeId, pinnedState]);

  useEffect(() => {
    setAuth(globalAuth ?? { isLoggedIn: false });
    setAuthEnabled(!!globalAuth);
  }, [globalAuth]);

  const zoomPercent = Math.round(zoom * 100);

  // Zoom controls
  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitAll = useCallback(
    () => fitView({ duration: 600, padding: 0.1 }),
    [fitView]
  );
  const handleFitSelection = useCallback(() => {
    if (activeNodeId) {
      fitView({ nodes: [{ id: activeNodeId }], duration: 600, padding: 0.5, maxZoom: 1.5 });
    }
  }, [activeNodeId, fitView]);

  // Open in editor
  const handleOpenInEditor = useCallback(() => {
    if (!activeNodeId) return;
    const route = routes.find((r) => r.id === activeNodeId);
    if (route?.componentFilePath) {
      window.open(`vscode://file/${route.componentFilePath}`, '_self');
    }
  }, [activeNodeId, routes]);

  // Open in browser
  const handleOpenInBrowser = useCallback(() => {
    if (!activeNodeId) return;
    const route = routes.find((r) => r.id === activeNodeId);
    if (route) {
      window.open(`${devServerUrl}${route.routePath}`, '_blank');
    }
  }, [activeNodeId, routes, devServerUrl]);

  // Export as PNG
  const handleExportPng = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;
    const bgColor = canvasTheme === 'dark' ? '#0c0c0e' : '#f5f5f5';
    toPng(viewport, {
      backgroundColor: bgColor,
      pixelRatio: 2,
      filter: (node) => {
        const classes = node.classList?.toString() ?? '';
        return !classes.includes('react-flow__minimap') &&
          !classes.includes('react-flow__controls') &&
          !classes.includes('react-flow__panel') &&
          !classes.includes('fc-control-panel') &&
          !classes.includes('fc-status-bar') &&
          !classes.includes('fc-screen-list');
      },
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'mappd-flow.png';
      link.href = dataUrl;
      link.click();
    });
  }, [canvasTheme]);

  // Export as PDF
  const handleExportPdf = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;
    const bgColor = canvasTheme === 'dark' ? '#0c0c0e' : '#f5f5f5';
    toPng(viewport, {
      backgroundColor: bgColor,
      pixelRatio: 2,
      filter: (node) => {
        const classes = node.classList?.toString() ?? '';
        return !classes.includes('react-flow__minimap') &&
          !classes.includes('react-flow__controls') &&
          !classes.includes('react-flow__panel') &&
          !classes.includes('fc-control-panel') &&
          !classes.includes('fc-status-bar') &&
          !classes.includes('fc-screen-list');
      },
    }).then((dataUrl) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(
        `<html><head><title>Mappd Flow</title>` +
        `<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:${bgColor}}` +
        `img{max-width:100%;max-height:100vh}@media print{body{background:white}}</style>` +
        `</head><body><img src="${dataUrl}" />` +
        `<script>setTimeout(()=>{window.print()},300)<\/script>` +
        `</body></html>`
      );
      printWindow.document.close();
    });
  }, [canvasTheme]);

  // Pin state handlers
  const handleParamChange = (name: string, value: string) => {
    if (!activeNodeId) return;
    const next = { ...urlParams, [name]: value };
    setUrlParams(next);
    onUpdatePin(activeNodeId, { urlParams: next });
  };

  const handleAuthToggle = () => {
    if (authEnabled) {
      setAuthEnabled(false);
      onUpdateAuth(undefined);
    } else {
      setAuthEnabled(true);
      const defaultAuth: PinnedAuth = { isLoggedIn: true, username: 'testuser', role: 'admin' };
      setAuth(defaultAuth);
      onUpdateAuth(defaultAuth);
    }
  };

  const handleAuthChange = (field: keyof PinnedAuth, value: string | boolean) => {
    const next = { ...auth, [field]: value };
    setAuth(next);
    onUpdateAuth(next);
  };

  const handleClearParams = () => {
    if (!activeNodeId) return;
    setUrlParams({});
    onClearPin(activeNodeId);
  };

  const isActiveLive = activeNodeId ? liveOverrides[activeNodeId] : undefined;

  return (
    <div className="fc-control-panel">
      {/* Header — Figma-style: element name is the panel identity */}
      <div className="fc-cp-header">
        {activeRoute ? (
          <div className="fc-cp-header-selected">
            <span className="fc-cp-header-name">{activeRoute.routePath}</span>
            <span className="fc-cp-header-sub">{activeRoute.componentName}</span>
          </div>
        ) : (
          <span className="fc-cp-header-name">Canvas</span>
        )}
        {activeRoute && (
          <div className="fc-cp-icon-bar">
            <button className="fc-cp-icon-btn" onClick={() => activeNodeId && onReloadScreen(activeNodeId)} title="Reload">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            </button>
            <button className="fc-cp-icon-btn" onClick={() => activeNodeId && onToggleLive(activeNodeId)} title={isActiveLive === false ? 'Go live' : 'Thumbnail'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isActiveLive === false ? (<><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>) : (<><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></>)}
              </svg>
            </button>
            <button className="fc-cp-icon-btn" onClick={handleOpenInEditor} disabled={!activeRoute?.componentFilePath} title="Open in editor">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button className="fc-cp-icon-btn" onClick={handleOpenInBrowser} title="Open in browser">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </button>
          </div>
        )}
      </div>

      <div className="fc-cp-body">
        {activeRoute && (
          <>

            {/* ── Pin State ── */}
            <section className="fc-cp-section">
              <h4 className="fc-cp-section-title">Pin state</h4>
              <div style={{ marginBottom: paramNames.length > 0 ? 10 : 0 }}>
                <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                  <span className="fc-cp-toggle-label">
                    Auth <span className="pin-global-badge">GLOBAL</span>
                  </span>
                  <button className={`fc-cp-pill-toggle ${authEnabled ? 'is-on' : ''}`} onClick={handleAuthToggle}>
                    <span className="fc-cp-pill-knob" />
                  </button>
                </div>
                {authEnabled && (
                  <div className="fc-cp-pin-fields">
                    <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                      <span className="fc-cp-toggle-label">Logged In</span>
                      <button className={`fc-cp-pill-toggle ${auth.isLoggedIn ? 'is-on' : ''}`} onClick={() => handleAuthChange('isLoggedIn', !auth.isLoggedIn)}>
                        <span className="fc-cp-pill-knob" />
                      </button>
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Username</label>
                      <input className="pin-input" type="text" value={auth.username ?? ''} onChange={(e) => handleAuthChange('username', e.target.value)} placeholder="testuser" />
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Role</label>
                      <input className="pin-input" type="text" value={auth.role ?? ''} onChange={(e) => handleAuthChange('role', e.target.value)} placeholder="admin" />
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Token</label>
                      <input className="pin-input" type="text" value={auth.token ?? ''} onChange={(e) => handleAuthChange('token', e.target.value)} placeholder="mock-jwt-token" />
                    </div>
                  </div>
                )}
              </div>
              {paramNames.length > 0 && (
                <div>
                  <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                    <span className="fc-cp-toggle-label">URL Params <span className="pin-node-badge">THIS NODE</span></span>
                  </div>
                  {paramNames.map((name) => (
                    <div key={name} className="pin-field">
                      <label className="pin-label">:{name}</label>
                      <input className="pin-input" type="text" value={urlParams[name] ?? ''} onChange={(e) => handleParamChange(name, e.target.value)} placeholder={`Value for :${name}`} />
                    </div>
                  ))}
                  <button className="fc-cp-btn fc-cp-btn-full" onClick={handleClearParams} style={{ marginTop: 4 }}>Clear Params</button>
                </div>
              )}
            </section>

            {/* ── States ── */}
            {stateScreens && stateScreens.length > 0 && (
              <section className="fc-cp-section">
                <h4 className="fc-cp-section-title">
                  States
                  <span className="fc-dt-badge fc-dt-badge-pending" style={{ marginLeft: 6 }}>{stateScreens.length}</span>
                </h4>
                <div className="fc-cp-states-list">
                  {stateScreens.map((s, i) => (
                    <button
                      key={i}
                      className="fc-cp-state-btn"
                      onClick={() => onOverrideState?.(s.hookIndex, s.stateValue)}
                      title={`Set ${s.hookType} hook #${s.hookIndex} to ${JSON.stringify(s.stateValue)}`}
                    >
                      <span className="fc-cp-state-name">{s.name}</span>
                      <span className={`fc-cp-state-confidence fc-cp-confidence-${s.confidence}`}>
                        {s.confidence === 'high' ? '●' : s.confidence === 'medium' ? '◐' : '○'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ── DevTools ── */}
            {devToolsState && (
              <section className="fc-cp-section fc-cp-section-devtools">
                <h4 className="fc-cp-section-title">DevTools</h4>
                <DevToolsPanel
                  state={devToolsState}
                  nodeId={activeNodeId!}
                  onClearConsole={onClearConsole}
                  onClearNetwork={onClearNetwork}
                  onRequestStorage={onRequestStorage}
                  iframeRef={activeIframeRef}
                />
              </section>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            CANVAS-WIDE — each section collapsible
            ══════════════════════════════════════════ */}

        {/* ── Zoom ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('zoom')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Zoom</span>
            <span className="fc-cp-zoom-value" style={{ marginLeft: 'auto', marginRight: 6 }}>{zoomPercent}%</span>
            <svg className={`fc-cp-chevron ${openSections.zoom ? 'is-open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openSections.zoom && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-zoom-row">
                <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomOut} title="Zoom out">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <span className="fc-cp-zoom-value">{zoomPercent}%</span>
                <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomIn} title="Zoom in">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>
              <div className="fc-cp-zoom-actions">
                <button className="fc-cp-btn" onClick={handleFitAll}>Fit All</button>
                <button className="fc-cp-btn" onClick={handleFitSelection} disabled={!activeNodeId}>Fit Selection</button>
              </div>
            </div>
          )}
        </section>

        {/* ── Viewport ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('viewport')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Viewport</span>
            <span className="fc-cp-collapse-arrow-label">{VIEWPORT_PRESETS[currentViewport].label}</span>
            <svg className={`fc-cp-chevron ${openSections.viewport ? 'is-open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openSections.viewport && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-viewport-row">
                {(Object.entries(VIEWPORT_PRESETS) as [ViewportPreset, typeof VIEWPORT_PRESETS[ViewportPreset]][]).map(([key, preset]) => (
                  <button key={key} className={`fc-cp-viewport-btn ${currentViewport === key ? 'is-active' : ''}`} onClick={() => onViewportChange(key)} title={`${preset.width}x${preset.height}`}>
                    <span className="fc-cp-viewport-label">{preset.label}</span>
                    <span className="fc-cp-viewport-dims">{preset.width}x{preset.height}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Display (includes theme, edges, labels, edge style) ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('display')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Display</span>
            <svg className={`fc-cp-chevron ${openSections.display ? 'is-open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openSections.display && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-display-grid">
                <div className="fc-cp-toggle-row">
                  <span className="fc-cp-toggle-label">Theme</span>
                  <div className="fc-cp-segmented">
                    <button className={`fc-cp-seg-btn ${canvasTheme === 'dark' ? 'is-active' : ''}`} onClick={() => onThemeChange('dark')}>Dark</button>
                    <button className={`fc-cp-seg-btn ${canvasTheme === 'light' ? 'is-active' : ''}`} onClick={() => onThemeChange('light')}>Light</button>
                  </div>
                </div>
                <div className="fc-cp-toggle-row">
                  <span className="fc-cp-toggle-label">Edges</span>
                  <button className={`fc-cp-pill-toggle ${showEdges ? 'is-on' : ''}`} onClick={onToggleEdges}><span className="fc-cp-pill-knob" /></button>
                </div>
                <div className="fc-cp-toggle-row">
                  <span className="fc-cp-toggle-label">Labels</span>
                  <button className={`fc-cp-pill-toggle ${showLabels ? 'is-on' : ''}`} onClick={onToggleLabels}><span className="fc-cp-pill-knob" /></button>
                </div>
                <div className="fc-cp-toggle-col">
                  <span className="fc-cp-toggle-label">Edge style</span>
                  <div className="fc-cp-segmented fc-cp-segmented-full">
                    {(['solid', 'dashed', 'animated'] as EdgeStyle[]).map((s) => (
                      <button key={s} className={`fc-cp-seg-btn ${edgeStyle === s ? 'is-active' : ''}`} onClick={() => onEdgeStyleChange(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Layout ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('layout')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Layout</span>
            <span className="fc-cp-collapse-arrow-label">{layoutDirection}</span>
            <svg className={`fc-cp-chevron ${openSections.layout ? 'is-open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openSections.layout && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-toggle-row" style={{ marginBottom: 6 }}>
                <span className="fc-cp-toggle-label">Direction</span>
                <div className="fc-cp-segmented">
                  <button className={`fc-cp-seg-btn ${layoutDirection === 'LR' ? 'is-active' : ''}`} onClick={() => onLayoutDirectionChange('LR')} title="Left → Right">LR</button>
                  <button className={`fc-cp-seg-btn ${layoutDirection === 'TB' ? 'is-active' : ''}`} onClick={() => onLayoutDirectionChange('TB')} title="Top → Bottom">TB</button>
                </div>
              </div>
              <button className="fc-cp-btn fc-cp-btn-full" onClick={onReLayout}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                Re-layout
              </button>
            </div>
          )}
        </section>

        {/* ── Export ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('export')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Export</span>
            <svg className={`fc-cp-chevron ${openSections.export ? 'is-open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openSections.export && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-actions">
                <button className="fc-cp-btn fc-cp-btn-full" onClick={handleExportPng}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  PNG
                </button>
                <button className="fc-cp-btn fc-cp-btn-full" onClick={handleExportPdf}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  PDF
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export { VIEWPORT_PRESETS };
export type { ViewportPreset, RouteInfo, CanvasTheme, EdgeStyle };
