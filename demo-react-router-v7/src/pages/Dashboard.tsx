import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface User {
  id: number
  name: string
  email: string
  company: { name: string }
}

const stats = [
  { label: 'Total Users', value: '2,847' },
  { label: 'Active Today', value: '483' },
  { label: 'Revenue', value: '$12.4k' },
  { label: 'Growth', value: '+14.2%' },
]

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[Dashboard] mounted')
    localStorage.setItem('dashboard_last_visit', new Date().toISOString())
    console.log('[Dashboard] wrote dashboard_last_visit to localStorage')

    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data.slice(0, 5))
        localStorage.setItem('dashboard_users_cache', JSON.stringify(data.slice(0, 5)))
        console.log('[Dashboard] fetched and cached users', data.length)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[Dashboard] fetch error', err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Quick Add
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="card stat-card">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 32, marginBottom: 4 }}>Team Members</h3>
      <p className="muted">Click a member to view details</p>

      {loading ? (
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading users...</p>
      ) : (
        <div className="user-grid">
          {users.map((user) => (
            <Link to={`/dashboard/users/${user.id}`} key={user.id} className="user-card">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>
                {user.company.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Quick Add</h3>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="New team member" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
