import { useReducer, useState, useEffect } from 'react'

type FilterStatus = 'all' | 'active' | 'inactive'

interface FilterState {
  status: FilterStatus
  search: string
}

type FilterAction =
  | { type: 'SET_STATUS'; payload: FilterStatus }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'RESET' }

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'RESET':
      return { status: 'all', search: '' }
    default:
      return state
  }
}

interface User {
  id: number
  name: string
  email: string
  company: { name: string }
}

const statusMap: Record<number, 'active' | 'inactive'> = {
  1: 'active', 2: 'active', 3: 'inactive', 4: 'active', 5: 'inactive',
  6: 'active', 7: 'active', 8: 'inactive', 9: 'active', 10: 'inactive',
}

export default function AdminUsers() {
  const [filters, dispatch] = useReducer(filterReducer, { status: 'all', search: '' })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users.filter((user) => {
    const matchStatus = filters.status === 'all' || statusMap[user.id] === filters.status
    const matchSearch = !filters.search || user.name.toLowerCase().includes(filters.search.toLowerCase()) || user.email.toLowerCase().includes(filters.search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="page-header">
        <h2>User Management</h2>
        <span className="muted">{filtered.length} users</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            />
          </div>
          <div className="filter-buttons">
            {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                className={`btn ${filters.status === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => dispatch({ type: 'SET_STATUS', payload: status })}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'RESET' })}
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading users...</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header">
            <span>User</span>
            <span>Email</span>
            <span>Company</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map((user) => (
            <div
              key={user.id}
              className={`admin-table-row${selectedUser === user.id ? ' selected' : ''}`}
              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </span>
              <span className="muted">{user.email}</span>
              <span>{user.company.name}</span>
              <span>
                <span className={`status-badge status-${statusMap[user.id]}`}>
                  {statusMap[user.id]}
                </span>
              </span>
              <span>
                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                  Edit
                </button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
              No users match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
