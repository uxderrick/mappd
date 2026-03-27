import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1>React Router v7</h1>
        <p className="tagline">SPA mode demo with nested routes, dynamic segments, and modern patterns</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">Dashboard</Link>
          <Link to="/admin" className="btn btn-secondary btn-lg">Admin</Link>
        </div>
      </div>
    </div>
  )
}
