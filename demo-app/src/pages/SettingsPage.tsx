import { useState } from 'react';
import { Link } from 'react-router-dom';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // General tab state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Notifications tab state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [frequency, setFrequency] = useState('daily');

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    alert(`${activeTab} settings saved!`);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {/* Tab bar — string enum pattern for state detector */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#6366f1' : '#64748b',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General tab */}
      {activeTab === 'general' && (
        <div className="card">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="toggle-label">
              <span>Dark Mode</span>
              <button
                type="button"
                className={`toggle ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                <span className="toggle-knob" />
              </button>
            </label>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="form-group">
            <label className="toggle-label">
              <span>Email Notifications</span>
              <button
                type="button"
                className={`toggle ${emailNotifs ? 'active' : ''}`}
                onClick={() => setEmailNotifs(!emailNotifs)}
              >
                <span className="toggle-knob" />
              </button>
            </label>
          </div>
          <div className="form-group">
            <label className="toggle-label">
              <span>Push Notifications</span>
              <button
                type="button"
                className={`toggle ${pushNotifs ? 'active' : ''}`}
                onClick={() => setPushNotifs(!pushNotifs)}
              >
                <span className="toggle-knob" />
              </button>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="frequency">Notification Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                borderRadius: 6, fontSize: 14, background: '#fff',
              }}
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>Save Notifications</button>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="toggle-label">
              <span>Two-Factor Authentication</span>
              <button
                type="button"
                className={`toggle ${twoFactor ? 'active' : ''}`}
                onClick={() => setTwoFactor(!twoFactor)}
              >
                <span className="toggle-knob" />
              </button>
            </label>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>Update Security</button>
        </div>
      )}
    </div>
  );
}
