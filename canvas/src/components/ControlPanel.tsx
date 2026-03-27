import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { toPng } from 'html-to-image';
import type { LayoutDirection } from '../lib/layoutGraph';
import type { PinnedState, PinnedAuth } from '../types';

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
  onSelectNode: (nodeId: string) => void;
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
  // Pin state (context-aware)
  pinnedState?: PinnedState;
  globalAuth?: PinnedAuth;
  onUpdatePin: (nodeId: string, pin: Partial<PinnedState>) => void;
  onClearPin: (nodeId: string) => void;
  onUpdateAuth: (auth: PinnedAuth | undefined) => void;
}

export default function ControlPanel({
  routes,
  activeNodeId,
  onSelectNode,
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
}: ControlPanelProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pin state (local mirrors for responsive editing)
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

  // Sync when active node or pinned state changes
  useEffect(() => {
    setUrlParams(pinnedState?.urlParams ?? {});
  }, [activeNodeId, pinnedState]);

  useEffect(() => {
    setAuth(globalAuth ?? { isLoggedIn: false });
    setAuthEnabled(!!globalAuth);
  }, [globalAuth]);

  const zoomPercent = Math.round(zoom * 100);

  // Screen selector
  const handleSelectRoute = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);
      fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.5, maxZoom: 1.5 });
      setDropdownOpen(false);
    },
    [onSelectNode, fitView]
  );

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
          !classes.includes('fc-status-bar');
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
          !classes.includes('fc-status-bar');
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
  const [canvasSettingsOpen, setCanvasSettingsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className="fc-cp-toggle fc-cp-toggle--closed"
        onClick={() => setIsOpen(true)}
        title="Open control panel"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fc-control-panel">
      {/* Header */}
      <div className="fc-cp-header">
        <span className="fc-cp-title">Controls</span>
        <button className="fc-cp-close" onClick={() => setIsOpen(false)} title="Close panel">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="fc-cp-body">
        {/* ── Screen Selector ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Screen</h4>
          <div className="fc-cp-dropdown-wrap" ref={dropdownRef}>
            <button
              className="fc-cp-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="fc-cp-dropdown-value">
                {activeRoute?.routePath ?? 'Select a screen'}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="fc-cp-dropdown-menu">
                {routes.map((r) => (
                  <button
                    key={r.id}
                    className={`fc-cp-dropdown-item ${r.id === activeNodeId ? 'is-active' : ''}`}
                    onClick={() => handleSelectRoute(r.id)}
                  >
                    <span className="fc-cp-dropdown-item-route">{r.routePath}</span>
                    <span className="fc-cp-dropdown-item-component">{r.componentName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SELECTED NODE — context-aware sections
            ══════════════════════════════════════════ */}
        {activeRoute && (
          <>
            {/* ── Selected Node Info ── */}
            <section className="fc-cp-section fc-cp-section-selected">
              <div className="fc-cp-selected-header">
                <span className="fc-cp-selected-route">{activeRoute.routePath}</span>
                <span className="fc-cp-selected-component">{activeRoute.componentName}</span>
              </div>
            </section>

            {/* ── Pin State ── */}
            <section className="fc-cp-section">
              <h4 className="fc-cp-section-title">
                Pin State
                <span className="pin-global-badge" style={{ marginLeft: 6 }}>SELECTED</span>
              </h4>

              {/* Auth Context */}
              <div style={{ marginBottom: 10 }}>
                <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                  <span className="fc-cp-toggle-label">
                    Auth <span className="pin-global-badge">GLOBAL</span>
                  </span>
                  <button
                    className={`fc-cp-pill-toggle ${authEnabled ? 'is-on' : ''}`}
                    onClick={handleAuthToggle}
                  >
                    <span className="fc-cp-pill-knob" />
                  </button>
                </div>
                {authEnabled && (
                  <div className="fc-cp-pin-fields">
                    <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                      <span className="fc-cp-toggle-label">Logged In</span>
                      <button
                        className={`fc-cp-pill-toggle ${auth.isLoggedIn ? 'is-on' : ''}`}
                        onClick={() => handleAuthChange('isLoggedIn', !auth.isLoggedIn)}
                      >
                        <span className="fc-cp-pill-knob" />
                      </button>
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Username</label>
                      <input
                        className="pin-input"
                        type="text"
                        value={auth.username ?? ''}
                        onChange={(e) => handleAuthChange('username', e.target.value)}
                        placeholder="testuser"
                      />
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Role</label>
                      <input
                        className="pin-input"
                        type="text"
                        value={auth.role ?? ''}
                        onChange={(e) => handleAuthChange('role', e.target.value)}
                        placeholder="admin"
                      />
                    </div>
                    <div className="pin-field">
                      <label className="pin-label">Token</label>
                      <input
                        className="pin-input"
                        type="text"
                        value={auth.token ?? ''}
                        onChange={(e) => handleAuthChange('token', e.target.value)}
                        placeholder="mock-jwt-token"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* URL Params */}
              {paramNames.length > 0 && (
                <div>
                  <div className="fc-cp-toggle-row" style={{ marginBottom: 4 }}>
                    <span className="fc-cp-toggle-label">
                      URL Params <span className="pin-node-badge">THIS NODE</span>
                    </span>
                  </div>
                  {paramNames.map((name) => (
                    <div key={name} className="pin-field">
                      <label className="pin-label">:{name}</label>
                      <input
                        className="pin-input"
                        type="text"
                        value={urlParams[name] ?? ''}
                        onChange={(e) => handleParamChange(name, e.target.value)}
                        placeholder={`Value for :${name}`}
                      />
                    </div>
                  ))}
                  <button
                    className="fc-cp-btn fc-cp-btn-full"
                    onClick={handleClearParams}
                    style={{ marginTop: 4 }}
                  >
                    Clear URL Params
                  </button>
                </div>
              )}
            </section>

            {/* ── Node Actions ── */}
            <section className="fc-cp-section">
              <h4 className="fc-cp-section-title">Node Actions</h4>
              <div className="fc-cp-actions">
                <button className="fc-cp-btn fc-cp-btn-full" onClick={() => activeNodeId && onReloadScreen(activeNodeId)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Reload Screen
                </button>
                <button className="fc-cp-btn fc-cp-btn-full" onClick={() => activeNodeId && onToggleLive(activeNodeId)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isActiveLive === false ? (
                      <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>
                    ) : (
                      <><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></>
                    )}
                  </svg>
                  {isActiveLive === false ? 'Go Live' : 'Show Thumbnail'}
                </button>
                <button className="fc-cp-btn fc-cp-btn-full" onClick={handleOpenInEditor} disabled={!activeRoute?.componentFilePath} title={activeRoute?.componentFilePath ?? 'No file path'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Open in Editor
                </button>
                <button className="fc-cp-btn fc-cp-btn-full" onClick={handleOpenInBrowser}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open in Browser
                </button>
              </div>
            </section>
          </>
        )}

        {/* ══════════════════════════════════════════
            CANVAS-WIDE settings
            ══════════════════════════════════════════ */}

        {/* Collapsible header when a node is selected */}
        {activeRoute && (
          <button
            className="fc-cp-canvas-toggle"
            onClick={() => setCanvasSettingsOpen((v) => !v)}
          >
            <span className="fc-cp-section-title" style={{ margin: 0 }}>Canvas</span>
            <span className={`fc-cp-canvas-arrow ${canvasSettingsOpen ? 'is-open' : ''}`}>▾</span>
          </button>
        )}

        {(!activeRoute || canvasSettingsOpen) && (
          <>
        {/* ── Zoom Controls ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Zoom</h4>
          <div className="fc-cp-zoom-row">
            <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomOut} title="Zoom out">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="fc-cp-zoom-value">{zoomPercent}%</span>
            <button className="fc-cp-btn fc-cp-btn-icon" onClick={handleZoomIn} title="Zoom in">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="fc-cp-zoom-actions">
            <button className="fc-cp-btn" onClick={handleFitAll}>Fit All</button>
            <button className="fc-cp-btn" onClick={handleFitSelection} disabled={!activeNodeId}>
              Fit Selection
            </button>
          </div>
        </section>

        {/* ── Viewport Size ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Viewport</h4>
          <div className="fc-cp-viewport-row">
            {(Object.entries(VIEWPORT_PRESETS) as [ViewportPreset, typeof VIEWPORT_PRESETS[ViewportPreset]][]).map(
              ([key, preset]) => (
                <button
                  key={key}
                  className={`fc-cp-viewport-btn ${currentViewport === key ? 'is-active' : ''}`}
                  onClick={() => onViewportChange(key)}
                  title={`${preset.width}x${preset.height}`}
                >
                  <span className="fc-cp-viewport-label">{preset.label}</span>
                  <span className="fc-cp-viewport-dims">{preset.width}x{preset.height}</span>
                </button>
              )
            )}
          </div>
        </section>

        {/* ── Display ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Display</h4>
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
              <button className={`fc-cp-pill-toggle ${showEdges ? 'is-on' : ''}`} onClick={onToggleEdges}>
                <span className="fc-cp-pill-knob" />
              </button>
            </div>
            <div className="fc-cp-toggle-row">
              <span className="fc-cp-toggle-label">Labels</span>
              <button className={`fc-cp-pill-toggle ${showLabels ? 'is-on' : ''}`} onClick={onToggleLabels}>
                <span className="fc-cp-pill-knob" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Edge Style ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Edge Style</h4>
          <div className="fc-cp-segmented fc-cp-segmented-full">
            {(['solid', 'dashed', 'animated'] as EdgeStyle[]).map((s) => (
              <button key={s} className={`fc-cp-seg-btn ${edgeStyle === s ? 'is-active' : ''}`} onClick={() => onEdgeStyleChange(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Layout ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Layout</h4>
          <div className="fc-cp-toggle-row" style={{ marginBottom: 6 }}>
            <span className="fc-cp-toggle-label">Direction</span>
            <div className="fc-cp-segmented">
              <button className={`fc-cp-seg-btn ${layoutDirection === 'LR' ? 'is-active' : ''}`} onClick={() => onLayoutDirectionChange('LR')} title="Left to Right">LR</button>
              <button className={`fc-cp-seg-btn ${layoutDirection === 'TB' ? 'is-active' : ''}`} onClick={() => onLayoutDirectionChange('TB')} title="Top to Bottom">TB</button>
            </div>
          </div>
          <button className="fc-cp-btn fc-cp-btn-full" onClick={onReLayout}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Re-layout
          </button>
        </section>

        {/* ── Export ── */}
        <section className="fc-cp-section">
          <h4 className="fc-cp-section-title">Export</h4>
          <div className="fc-cp-actions">
            <button className="fc-cp-btn fc-cp-btn-full" onClick={handleExportPng}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export as PNG
            </button>
            <button className="fc-cp-btn fc-cp-btn-full" onClick={handleExportPdf}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Export as PDF
            </button>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

export { VIEWPORT_PRESETS };
export type { ViewportPreset, RouteInfo, CanvasTheme, EdgeStyle };
