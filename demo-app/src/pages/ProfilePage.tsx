import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { username } = useAuth();

  return (
    <div>
      <h2>My Profile</h2>
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, margin: '0 auto 16px' }}>
          {(username || 'U')[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{username || 'User'}</div>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Frontend Developer</div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>12</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Projects</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>48</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Tasks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>3</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Teams</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Link to="/dashboard/settings" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Edit Settings</Link>
        <Link to="/dashboard" className="btn" style={{ flex: 1, textAlign: 'center', background: '#e2e8f0', color: '#1e293b' }}>Back to Dashboard</Link>
      </div>
    </div>
  );
}
