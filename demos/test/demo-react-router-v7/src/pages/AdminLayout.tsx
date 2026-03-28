import { NavLink, Outlet, Link } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Admin Home', end: true },
  { to: '/admin/users', label: 'User Management', end: false },
  { to: '/dashboard', label: 'Dashboard', end: false },
]

export default function AdminLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar sidebar-admin">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ background: '#dc2626' }}>A</div>
          <div>
            <div className="sidebar-title">Admin Panel</div>
            <div className="sidebar-user">admin@example.com</div>
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
