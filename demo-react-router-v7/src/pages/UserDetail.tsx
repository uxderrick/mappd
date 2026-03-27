import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface UserData {
  id: number
  name: string
  email: string
  phone: string
  website: string
  company: { name: string; catchPhrase: string; bs: string }
  address: { street: string; suite: string; city: string; zipcode: string }
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log(`[UserDetail] loading user ${id}`)
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => res.json())
      .then((data: UserData) => {
        setUser(data)
        console.log(`[UserDetail] loaded user: ${data.name}`)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[UserDetail] fetch error', err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p style={{ color: '#64748b' }}>Loading user...</p>
  if (!user) return <p>User not found</p>

  return (
    <div>
      <Link to="/dashboard" style={{ color: '#6366f1', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>

      <div className="card user-detail">
        <div className="user-detail-avatar">{user.name.charAt(0)}</div>
        <h2>{user.name}</h2>
        <p className="muted">{user.email}</p>

        <h3>Details</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Phone</span>
            {user.phone}
          </div>
          <div className="detail-item">
            <span className="detail-label">Website</span>
            {user.website}
          </div>
          <div className="detail-item">
            <span className="detail-label">Company</span>
            {user.company.name}
          </div>
          <div className="detail-item">
            <span className="detail-label">Address</span>
            {user.address.street}, {user.address.city}
          </div>
          <div className="detail-item">
            <span className="detail-label">Zipcode</span>
            {user.address.zipcode}
          </div>
          <div className="detail-item">
            <span className="detail-label">Catch Phrase</span>
            {user.company.catchPhrase}
          </div>
        </div>
      </div>
    </div>
  )
}
