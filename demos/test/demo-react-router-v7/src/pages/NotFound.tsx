import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const location = useLocation()

  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p className="muted">
          No route matches <code>{location.pathname}</code>
        </p>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
      </div>
    </div>
  )
}
