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
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Team Members</h2>
        <Link to="/dashboard/create-project" className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }}>
          + New Project
        </Link>
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
