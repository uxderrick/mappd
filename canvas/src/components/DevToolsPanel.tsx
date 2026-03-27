import { memo, useState, useRef, useEffect, useCallback } from 'react';
import type { DevToolsNodeState, DevToolsConsoleEntry, DevToolsNetworkEntry } from '../types';

interface DevToolsPanelProps {
  state: DevToolsNodeState;
  nodeId: string;
  onClearConsole: (nodeId: string) => void;
  onClearNetwork: (nodeId: string) => void;
  onRequestStorage: (iframe: HTMLIFrameElement) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

type Tab = 'console' | 'network' | 'application';

function DevToolsPanel({ state, nodeId, onClearConsole, onClearNetwork, onRequestStorage, iframeRef }: DevToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('console');
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (autoScroll && activeTab === 'console' && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.console.length, activeTab, autoScroll]);

  const handleConsoleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setAutoScroll(atBottom);
  }, []);

  const errorCount = state.console.filter(e => e.level === 'error').length;
  const warnCount = state.console.filter(e => e.level === 'warn').length;

  return (
    <div className="fc-dt">
      {/* Tab bar */}
      <div className="fc-dt-tabs">
        <button className={`fc-dt-tab ${activeTab === 'console' ? 'is-active' : ''}`} onClick={() => setActiveTab('console')}>
          Console
          {errorCount > 0 && <span className="fc-dt-badge fc-dt-badge-error">{errorCount}</span>}
          {warnCount > 0 && <span className="fc-dt-badge fc-dt-badge-warn">{warnCount}</span>}
        </button>
        <button className={`fc-dt-tab ${activeTab === 'network' ? 'is-active' : ''}`} onClick={() => setActiveTab('network')}>
          Network
          {state.network.filter(e => !e.completed).length > 0 && <span className="fc-dt-badge fc-dt-badge-pending">{state.network.filter(e => !e.completed).length}</span>}
        </button>
        <button className={`fc-dt-tab ${activeTab === 'application' ? 'is-active' : ''}`} onClick={() => {
          setActiveTab('application');
          if (iframeRef.current) onRequestStorage(iframeRef.current);
        }}>
          Storage
        </button>
        <div className="fc-dt-tab-spacer" />
        {activeTab === 'console' && (
          <button className="fc-dt-clear" onClick={() => onClearConsole(nodeId)} title="Clear console">&#x2715;</button>
        )}
        {activeTab === 'network' && (
          <button className="fc-dt-clear" onClick={() => onClearNetwork(nodeId)} title="Clear network">&#x2715;</button>
        )}
      </div>

      {/* Console tab */}
      {activeTab === 'console' && (
        <div className="fc-dt-console" onScroll={handleConsoleScroll}>
          {state.console.length === 0 && <div className="fc-dt-empty">No console output</div>}
          {state.console.map(entry => (
            <ConsoleRow key={entry.id} entry={entry} />
          ))}
          <div ref={consoleEndRef} />
        </div>
      )}

      {/* Network tab */}
      {activeTab === 'network' && (
        <div className="fc-dt-network">
          {state.network.length === 0 && <div className="fc-dt-empty">No network requests</div>}
          {state.network.map(entry => (
            <NetworkRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Application tab */}
      {activeTab === 'application' && (
        <div className="fc-dt-storage">
          {!state.storage && <div className="fc-dt-empty">Loading storage...</div>}
          {state.storage && (
            <>
              <StorageSection title="localStorage" data={state.storage.localStorage} />
              <StorageSection title="sessionStorage" data={state.storage.sessionStorage} />
              <StorageSection title="Cookies" data={{ raw: state.storage.cookies }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConsoleRow({ entry }: { entry: DevToolsConsoleEntry }) {
  const time = new Date(entry.timestamp);
  const ts = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}.${time.getMilliseconds().toString().padStart(3, '0')}`;

  return (
    <div className={`fc-dt-console-row fc-dt-level-${entry.level}`}>
      <span className="fc-dt-console-time">{ts}</span>
      <span className="fc-dt-console-msg">{entry.args.join(' ')}</span>
    </div>
  );
}

function NetworkRow({ entry }: { entry: DevToolsNetworkEntry }) {
  const [expanded, setExpanded] = useState(false);
  const statusClass = entry.error ? 'fc-dt-status-error' : (entry.status && entry.status >= 400) ? 'fc-dt-status-error' : entry.completed ? 'fc-dt-status-ok' : 'fc-dt-status-pending';

  // Truncate URL for display
  const displayUrl = entry.url.length > 60 ? '...' + entry.url.slice(-57) : entry.url;

  return (
    <div className="fc-dt-network-row">
      <div className={`fc-dt-network-summary ${statusClass}`} onClick={() => setExpanded(!expanded)}>
        <span className="fc-dt-network-method">{entry.method}</span>
        <span className="fc-dt-network-url" title={entry.url}>{displayUrl}</span>
        <span className="fc-dt-network-status">{entry.error ? 'ERR' : entry.status ?? '...'}</span>
        <span className="fc-dt-network-duration">{entry.duration ? `${entry.duration}ms` : ''}</span>
        <span className="fc-dt-network-size">{entry.size ? formatBytes(entry.size) : ''}</span>
      </div>
      {expanded && (
        <div className="fc-dt-network-detail">
          {entry.requestBody && <div className="fc-dt-network-body"><strong>Request:</strong> <pre>{entry.requestBody}</pre></div>}
          {entry.responseBody && <div className="fc-dt-network-body"><strong>Response:</strong> <pre>{entry.responseBody.slice(0, 500)}</pre></div>}
          {entry.error && <div className="fc-dt-network-body fc-dt-level-error"><strong>Error:</strong> {entry.error}</div>}
        </div>
      )}
    </div>
  );
}

function StorageSection({ title, data }: { title: string; data: Record<string, string> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return (
    <div className="fc-dt-storage-section">
      <div className="fc-dt-storage-title">{title}</div>
      <div className="fc-dt-empty">Empty</div>
    </div>
  );

  return (
    <div className="fc-dt-storage-section">
      <div className="fc-dt-storage-title">{title} ({entries.length})</div>
      {entries.map(([key, value]) => (
        <div key={key} className="fc-dt-storage-row">
          <span className="fc-dt-storage-key">{key}</span>
          <span className="fc-dt-storage-value">{value.slice(0, 200)}</span>
        </div>
      ))}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

export default memo(DevToolsPanel);
