import { useState, useEffect } from 'react';
import type { PinnedState, PinnedAuth } from '../types';

interface PinPanelProps {
  nodeId: string;
  routePath: string;
  componentName: string;
  pinnedState?: PinnedState;
  globalAuth?: PinnedAuth;
  onUpdateNode: (nodeId: string, pin: Partial<PinnedState>) => void;
  onClearNode: (nodeId: string) => void;
  onUpdateAuth: (auth: PinnedAuth | undefined) => void;
  onClose: () => void;
}

export default function PinPanel({
  nodeId,
  routePath,
  componentName,
  pinnedState,
  globalAuth,
  onUpdateNode,
  onClearNode,
  onUpdateAuth,
  onClose,
}: PinPanelProps) {
  const paramNames = (routePath.match(/:(\w+)/g) || []).map((p) => p.slice(1));

  const [urlParams, setUrlParams] = useState<Record<string, string>>(
    pinnedState?.urlParams ?? {}
  );
  const [auth, setAuth] = useState<PinnedAuth>(
    globalAuth ?? { isLoggedIn: false }
  );
  const [authEnabled, setAuthEnabled] = useState(!!globalAuth);

  useEffect(() => {
    setUrlParams(pinnedState?.urlParams ?? {});
  }, [nodeId, pinnedState]);

  useEffect(() => {
    setAuth(globalAuth ?? { isLoggedIn: false });
    setAuthEnabled(!!globalAuth);
  }, [globalAuth]);

  const handleParamChange = (name: string, value: string) => {
    const next = { ...urlParams, [name]: value };
    setUrlParams(next);
    onUpdateNode(nodeId, { urlParams: next });
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

  const handleClearNode = () => {
    setUrlParams({});
    onClearNode(nodeId);
  };

  return (
    <div className="pin-panel">
      <div className="pin-panel-header">
        <div>
          <div className="pin-panel-title">Pin State</div>
          <div className="pin-panel-route">{routePath}</div>
          <div className="pin-panel-component">{componentName}</div>
        </div>
        <button className="pin-panel-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="pin-panel-body">
        {/* Global Auth — applies to ALL screens */}
        <section className="pin-section">
          <div className="pin-section-header">
            <h4 className="pin-section-title">Auth Context <span className="pin-global-badge">GLOBAL</span></h4>
            <label className="pin-toggle">
              <input
                type="checkbox"
                checked={authEnabled}
                onChange={handleAuthToggle}
              />
              <span className="pin-toggle-label">{authEnabled ? 'On' : 'Off'}</span>
            </label>
          </div>
          {authEnabled && (
            <div className="pin-auth-fields">
              <div className="pin-field">
                <label className="pin-label">Logged In</label>
                <label className="pin-toggle">
                  <input
                    type="checkbox"
                    checked={auth.isLoggedIn}
                    onChange={(e) => handleAuthChange('isLoggedIn', e.target.checked)}
                  />
                  <span className="pin-toggle-label">
                    {auth.isLoggedIn ? 'Yes' : 'No'}
                  </span>
                </label>
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
        </section>

        {/* Per-Node URL Params */}
        {paramNames.length > 0 && (
          <section className="pin-section">
            <h4 className="pin-section-title">URL Parameters <span className="pin-node-badge">THIS NODE</span></h4>
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
            <button className="pin-btn pin-btn-clear" onClick={handleClearNode} style={{ marginTop: 8 }}>
              Clear URL Params
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
