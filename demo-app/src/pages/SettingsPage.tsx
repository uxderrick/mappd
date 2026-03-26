import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    alert('Settings saved!');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
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
    </div>
  );
}
