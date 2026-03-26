import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#e2e8f0' }}>404</div>
      <h2 style={{ marginTop: 8, fontSize: 20 }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginTop: 8, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/dashboard" className="btn" style={{ background: '#e2e8f0', color: '#1e293b' }}>Dashboard</Link>
      </div>
    </div>
  );
}
