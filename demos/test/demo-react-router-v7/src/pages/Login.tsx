import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('[Login] submit', { email, password: '***' })
    localStorage.setItem('auth_token', 'demo-token-' + Date.now())
    localStorage.setItem('auth_user', email)
    console.log('[Login] token saved to localStorage')
    navigate('/dashboard')
  }

  return (
    <div className="login">
      <div className="card login-card">
        <h2>Sign In</h2>
        <p className="muted">Enter your credentials to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Sign In</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#64748b' }}>
          <Link to="/" style={{ color: '#6366f1' }}>Back to home</Link>
        </p>
      </div>
    </div>
  )
}
