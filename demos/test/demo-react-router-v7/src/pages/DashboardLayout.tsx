import { NavLink, Outlet, Link } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/settings', label: 'Settings', end: false },
  { to: '/admin', label: 'Admin Panel', end: false },
]

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">RR</div>
          <div>
            <div className="sidebar-title">React Router v7</div>
            <div className="sidebar-user">demo@example.com</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: 12 }}>
          <Link to="/" className="sidebar-link" style={{ display: 'block' }}>
            Logout
          </Link>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
