import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Total Views', value: '12,847', change: '+12%' },
  { label: 'Active Users', value: '1,234', change: '+5%' },
  { label: 'Projects', value: '48', change: '+2' },
  { label: 'Completion Rate', value: '87%', change: '+3%' },
];

const RECENT_ACTIVITY = [
  { user: 'Alice', action: 'completed task "Design Review"', time: '5 min ago', userId: 1 },
  { user: 'Bob', action: 'created project "API v2"', time: '20 min ago', userId: 2 },
  { user: 'Charlie', action: 'commented on "Landing Page"', time: '1 hour ago', userId: 3 },
  { user: 'Alice', action: 'deployed to production', time: '2 hours ago', userId: 1 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h2>Analytics</h2>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {STATS.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#22c55e', marginTop: 2 }}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <h3 style={{ fontSize: 14, marginBottom: 12 }}>Recent Activity</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RECENT_ACTIVITY.map((a, i) => (
          <div key={i} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Link to={`/dashboard/users/${a.userId}`} style={{ fontWeight: 600, color: '#6366f1', fontSize: 13 }}>{a.user}</Link>
              <span style={{ fontSize: 13 }}> {a.action}</span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
