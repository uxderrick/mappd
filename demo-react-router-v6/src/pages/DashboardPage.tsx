import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
];

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', exact: true },
  { path: '/dashboard/analytics', label: 'Analytics' },
  { path: '/dashboard/notifications', label: 'Notifications' },
  { path: '/dashboard/create-project', label: 'New Project' },
  { path: '/dashboard/settings', label: 'Settings' },
  { path: '/dashboard/profile', label: 'Profile' },
];

function DashboardHome() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickDesc, setQuickDesc] = useState('');

  // --- DevTools test: localStorage, console, and fetch ---
  useEffect(() => {
    // Console logs (will appear in DevTools Console tab)
    console.log('Dashboard mounted at', new Date().toLocaleTimeString());
    console.info('Loading team members...');
    console.warn('API rate limit: 95% used');

    // localStorage writes (will appear in DevTools Storage tab)
    localStorage.setItem('mappd-demo:lastVisited', '/dashboard');
    localStorage.setItem('mappd-demo:visitCount', String(Number(localStorage.getItem('mappd-demo:visitCount') || '0') + 1));
    localStorage.setItem('mappd-demo:theme', 'dark');
    sessionStorage.setItem('mappd-demo:sessionId', 'sess_' + Math.random().toString(36).slice(2, 8));

    // Fetch calls (will appear in DevTools Network tab)
    fetch('https://jsonplaceholder.typicode.com/users?_limit=3')
      .then(res => res.json())
      .then(data => console.log('Fetched users:', data.length))
      .catch(err => console.error('Failed to fetch users:', err.message));

    fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .then(res => res.json())
      .then(data => console.log('Fetched posts:', data.length))
      .catch(err => console.error('Failed to fetch posts:', err.message));
  }, []);

  const handleQuickAdd = () => {
    console.log('Creating project:', quickName);
    localStorage.setItem('mappd-demo:lastProject', quickName);
    alert(`Project created: ${quickName}`);
    setQuickName('');
    setQuickDesc('');
    setShowAddModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Team Members</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => setShowAddModal(true)}
          >
            Quick Add
          </button>
          <Link to="/dashboard/create-project" className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }}>
            + New Project
          </Link>
        </div>
      </div>
      <div className="user-grid">
        {USERS.map((user) => (
          <Link to={`/dashboard/users/${user.id}`} key={user.id} className="user-card">
            <div className="user-avatar">{user.name[0]}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Add Modal — boolean toggle pattern for state detector */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ width: 420, padding: 24, background: '#fff', borderRadius: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Quick Add Project</h3>
            <div className="form-group">
              <label htmlFor="quickName">Project Name</label>
              <input
                id="quickName"
                type="text"
                placeholder="Enter project name"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="quickDesc">Description</label>
              <textarea
                id="quickDesc"
                placeholder="Brief description of the project"
                value={quickDesc}
                onChange={(e) => setQuickDesc(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                  borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="quickPriority">Priority</label>
              <select
                id="quickPriority"
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                  borderRadius: 6, fontSize: 14, background: '#fff',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                className="btn"
                style={{ flex: 1, background: '#e2e8f0', color: '#1e293b' }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleQuickAdd}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { username } = useAuth();
  const location = useLocation();
  const isIndex = location.pathname === '/dashboard';

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">FC</div>
          <div>
            <div className="sidebar-title">Mappd</div>
            <div className="sidebar-user">Welcome, {username || 'User'}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/login" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
            Sign Out
          </Link>
        </div>
      </aside>
      <main className="main-content">
        {isIndex ? <DashboardHome /> : <Outlet />}
      </main>
    </div>
  );
}
