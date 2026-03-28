import { useState, useCallback, useEffect } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { toPng } from 'html-to-image';
import {
  ArrowClockwise,
  ArrowsClockwise,
  ArrowSquareOut,
  CaretDown,
  Download,
  Minus,
  Monitor,
  PencilSimple,
  Play,
  Plus,
} from '@phosphor-icons/react';
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
  onOverrideState?: (hookIndex: number, value: string | number | boolean | Record<string, unknown>, componentName?: string, hookType?: string) => void;
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
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();
  const { zoom } = useViewport();
  const [editingZoom, setEditingZoom] = useState(false);
  const [zoomInput, setZoomInput] = useState('');
  const [activeStateIndex, setActiveStateIndex] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pinState: true,
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
    setActiveStateIndex(null);
  }, [activeNodeId, pinnedState]);

  useEffect(() => {
    setAuth(globalAuth ?? { isLoggedIn: false });
    setAuthEnabled(!!globalAuth);
  }, [globalAuth]);

  const zoomPercent = Math.round(zoom * 100);

  // Zoom controls
  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleZoomInputStart = useCallback(() => {
    setZoomInput(String(zoomPercent));
    setEditingZoom(true);
  }, [zoomPercent]);
  const handleZoomInputCommit = useCallback(() => {
    const val = parseInt(zoomInput, 10);
    if (!isNaN(val) && val >= 10 && val <= 400) {
      zoomTo(val / 100, { duration: 200 });
    }
    setEditingZoom(false);
  }, [zoomInput, zoomTo]);
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



  const canvasFilter = (node: HTMLElement) => {
    const classes = node.classList?.toString() ?? '';
    return !classes.includes('react-flow__minimap') &&
      !classes.includes('react-flow__controls') &&
      !classes.includes('react-flow__panel') &&
      !classes.includes('fc-control-panel') &&
      !classes.includes('fc-status-bar') &&
      !classes.includes('fc-screen-list');
  };

  /**
   * For selected screen export: open the route in a new window at full size,
   * then trigger browser print/save. This avoids the cross-origin iframe capture issue.
   * For full canvas export: use html-to-image on the React Flow viewport.
   */

  // Export as PNG
  const handleExportPng = useCallback(() => {
    const bgColor = canvasTheme === 'dark' ? '#0c0c0e' : '#e4e4e8';
    const activeRoute = routes.find(r => r.id === activeNodeId);

    if (activeNodeId && activeRoute) {
      // Selected screen — open route directly for the user to screenshot
      // Also check if we have a cached screenshot
      const screenshotUrl = `/screenshots/${activeNodeId}.png`;
      fetch(screenshotUrl, { method: 'HEAD' }).then(res => {
        if (res.ok) {
          // Use cached Puppeteer screenshot
          const link = document.createElement('a');
          const routeName = activeRoute.routePath.replace(/\//g, '-').replace(/^-/, '') || 'screen';
          link.download = `mappd-${routeName}.png`;
          link.href = screenshotUrl;
          link.click();
        } else {
          // No screenshot — open route in new tab for manual capture
          window.open(`${devServerUrl}${activeRoute.routePath}`, '_blank');
        }
      }).catch(() => {
        window.open(`${devServerUrl}${activeRoute.routePath}`, '_blank');
      });
    } else {
      // Full canvas export
      const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewport) return;
      toPng(viewport, {
        backgroundColor: bgColor,
        pixelRatio: 2,
        filter: canvasFilter,
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mappd-flow.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, [canvasTheme, activeNodeId, routes, devServerUrl]);


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
              <ArrowClockwise size={14} />
            </button>
            <button className="fc-cp-icon-btn" onClick={() => activeNodeId && onToggleLive(activeNodeId)} title={isActiveLive === false ? 'Go live' : 'Thumbnail'}>
              {isActiveLive === false ? <Monitor size={14} /> : <Play size={14} />}
            </button>
            <button className="fc-cp-icon-btn" onClick={handleOpenInEditor} disabled={!activeRoute?.componentFilePath} title="Open in editor">
              <PencilSimple size={14} />
            </button>
            <button className="fc-cp-icon-btn" onClick={handleOpenInBrowser} title="Open in browser">
              <ArrowSquareOut size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="fc-cp-body">
        {activeRoute && (
          <>

            {/* ── Pin State ── */}
            <section className="fc-cp-section">
              <button className="fc-cp-section-toggle" onClick={() => toggleSection('pinState')}>
                <span className="fc-cp-section-title" style={{ margin: 0 }}>Pin state</span>
                {!openSections.pinState && (
                  <span className="fc-cp-collapse-arrow-label">
                    {authEnabled ? 'Auth on' : 'Auth off'}{paramNames.length > 0 ? `, ${paramNames.length} param${paramNames.length > 1 ? 's' : ''}` : ''}
                  </span>
                )}
                <CaretDown size={10} className={`fc-cp-chevron ${openSections.pinState ? 'is-open' : ''}`} />
              </button>
              {openSections.pinState && (
                <div className="fc-cp-section-body">
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
                      className={`fc-cp-state-btn ${activeStateIndex === i ? 'is-active' : ''}`}
                      onClick={() => { setActiveStateIndex(i); onOverrideState?.(s.hookIndex, s.stateValue, s.componentName, s.hookType); }}
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
            <CaretDown size={10} className={`fc-cp-chevron ${openSections.zoom ? 'is-open' : ''}`} />
          </button>
          {openSections.zoom && (
            <div className="fc-cp-section-body">
              <div className="fc-cp-zoom-row">
                <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomOut} title="Zoom out">
                  <Minus size={12} />
                </button>
                {editingZoom ? (
                  <input
                    className="fc-cp-zoom-input"
                    type="text"
                    value={zoomInput}
                    onChange={(e) => setZoomInput(e.target.value)}
                    onBlur={handleZoomInputCommit}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleZoomInputCommit(); if (e.key === 'Escape') setEditingZoom(false); }}
                    autoFocus
                  />
                ) : (
                  <button className="fc-cp-zoom-display" onClick={handleZoomInputStart} title="Click to set zoom">
                    {zoomPercent}%
                  </button>
                )}
                <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomIn} title="Zoom in">
                  <Plus size={12} />
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
            <CaretDown size={10} className={`fc-cp-chevron ${openSections.viewport ? 'is-open' : ''}`} />
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
            {!openSections.display && (
              <span className="fc-cp-collapse-arrow-label">
                {canvasTheme === 'light' ? 'Light' : 'Dark'}{showEdges ? '' : ', no edges'}{showLabels ? '' : ', no labels'}
              </span>
            )}
            <CaretDown size={10} className={`fc-cp-chevron ${openSections.display ? 'is-open' : ''}`} />
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
            <CaretDown size={10} className={`fc-cp-chevron ${openSections.layout ? 'is-open' : ''}`} />
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
                <ArrowsClockwise size={12} />
                Re-layout
              </button>
            </div>
          )}
        </section>

        {/* ── Export ── */}
        <section className="fc-cp-section">
          <button className="fc-cp-section-toggle" onClick={() => toggleSection('export')}>
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Export</span>
            {!openSections.export && (
              <span className="fc-cp-collapse-arrow-label">PNG</span>
            )}
            <CaretDown size={10} className={`fc-cp-chevron ${openSections.export ? 'is-open' : ''}`} />
          </button>
          {openSections.export && (
            <div className="fc-cp-section-body">
              {activeNodeId && (
                <div style={{ fontSize: 9, color: 'var(--fc-text-ghost)', marginBottom: 6, fontFamily: 'var(--fc-font-sans)' }}>
                  Exporting: {routes.find(r => r.id === activeNodeId)?.routePath ?? 'selected screen'}
                </div>
              )}
              {!activeNodeId && (
                <div style={{ fontSize: 9, color: 'var(--fc-text-ghost)', marginBottom: 6, fontFamily: 'var(--fc-font-sans)' }}>
                  Exporting: full canvas
                </div>
              )}
              <div className="fc-cp-actions">
                <button className="fc-cp-btn fc-cp-btn-full" onClick={handleExportPng}>
                  <Download size={12} />
                  {activeNodeId ? 'PNG (screen)' : 'PNG (canvas)'}
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
