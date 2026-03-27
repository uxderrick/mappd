import { useState, useEffect, useCallback } from 'react';

interface StatusBarProps {
  screenCount: number;
  connectionCount: number;
  devServerUrl: string;
}

export default function StatusBar({
  screenCount,
  connectionCount,
  devServerUrl,
}: StatusBarProps) {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Ping the dev server to check status
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      fetch(devServerUrl, { mode: 'no-cors', cache: 'no-store' })
        .then(() => { if (!cancelled) setServerOnline(true); })
        .catch(() => { if (!cancelled) setServerOnline(false); });
    };

    check();
    const interval = setInterval(check, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [devServerUrl]);

  const toggleShortcuts = useCallback(() => setShowShortcuts((v) => !v), []);

  // Close shortcuts on Escape
  useEffect(() => {
    if (!showShortcuts) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showShortcuts]);

  const host = devServerUrl.replace(/^https?:\/\//, '');

  return (
    <>
      <div className="fc-status-bar">
        {/* Left: Route count */}
        <div className="fc-sb-left">
          <span className="fc-sb-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {screenCount} screen{screenCount !== 1 ? 's' : ''}
          </span>
          <span className="fc-sb-divider" />
          <span className="fc-sb-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right: Server status + shortcuts */}
        <div className="fc-sb-right">
          <span className="fc-sb-server">
            <span
              className={`fc-sb-dot ${serverOnline === true ? 'is-online' : serverOnline === false ? 'is-offline' : 'is-checking'}`}
            />
            {host}
          </span>
          <span className="fc-sb-divider" />
          <button
            className="fc-sb-shortcuts-btn"
            onClick={toggleShortcuts}
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>

      {/* Shortcuts popover */}
      {showShortcuts && (
        <div className="fc-shortcuts-overlay" onClick={toggleShortcuts}>
          <div className="fc-shortcuts-panel" onClick={(e) => e.stopPropagation()}>
            <div className="fc-shortcuts-header">
              <span className="fc-shortcuts-title">Keyboard Shortcuts</span>
              <button className="fc-cp-close" onClick={toggleShortcuts}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="fc-shortcuts-body">
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Scroll</kbd></span>
                <span className="fc-shortcut-desc">Pan canvas</span>
              </div>
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Pinch</kbd> / <kbd>Ctrl</kbd>+<kbd>Scroll</kbd></span>
                <span className="fc-shortcut-desc">Zoom in/out</span>
              </div>
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Click</kbd> node</span>
                <span className="fc-shortcut-desc">Select & go live</span>
              </div>
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Click</kbd> canvas</span>
                <span className="fc-shortcut-desc">Deselect</span>
              </div>
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Drag</kbd> label</span>
                <span className="fc-shortcut-desc">Move node</span>
              </div>
              <div className="fc-shortcut-row">
                <span className="fc-shortcut-keys"><kbd>Esc</kbd></span>
                <span className="fc-shortcut-desc">Close panel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
