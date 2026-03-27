import { useState, useEffect, useCallback } from 'react';
import { Monitor, ArrowsLeftRight, Question, X } from '@phosphor-icons/react';

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
            <Monitor size={11} />
            {screenCount} screen{screenCount !== 1 ? 's' : ''}
          </span>
          <span className="fc-sb-divider" />
          <span className="fc-sb-stat">
            <ArrowsLeftRight size={11} />
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
            <Question size={12} weight="bold" />
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
                <X size={10} />
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
