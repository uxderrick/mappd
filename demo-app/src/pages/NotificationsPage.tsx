import { Link } from 'react-router-dom';

const NOTIFICATIONS = [
  { id: 1, title: 'Alice commented on your post', time: '2 min ago', read: false, userId: 1 },
  { id: 2, title: 'Bob invited you to a project', time: '1 hour ago', read: false, userId: 2 },
  { id: 3, title: 'Charlie liked your update', time: '3 hours ago', read: true, userId: 3 },
  { id: 4, title: 'System maintenance scheduled', time: '1 day ago', read: true, userId: null },
  { id: 5, title: 'New feature: Team Analytics', time: '2 days ago', read: true, userId: null },
];

export default function NotificationsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Notifications</h2>
        <span style={{ fontSize: 12, color: '#64748b' }}>{NOTIFICATIONS.filter(n => !n.read).length} unread</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="card" style={{ padding: '12px 16px', opacity: n.read ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{n.time}</div>
              </div>
              {n.userId && (
                <Link to={`/dashboard/users/${n.userId}`} style={{ fontSize: 12, color: '#6366f1' }}>
                  View Profile
                </Link>
              )}
            </div>
            {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', position: 'absolute', top: 16, right: 16 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
