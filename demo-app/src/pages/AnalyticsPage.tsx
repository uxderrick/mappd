import { useReducer } from 'react';
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

// useReducer-based filter state for state detector testing
type FilterView = 'overview' | 'detailed' | 'comparison';

interface FilterState {
  view: FilterView;
}

type FilterAction =
  | { type: 'SET_VIEW'; payload: FilterView };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    default:
      return state;
  }
}

const VIEW_OPTIONS: { key: FilterView; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'detailed', label: 'Detailed' },
  { key: 'comparison', label: 'Comparison' },
];

export default function AnalyticsPage() {
  const [filterState, dispatch] = useReducer(filterReducer, { view: 'overview' });

  return (
    <div>
      <h2>Analytics</h2>

      {/* Filter panel — useReducer pattern for state detector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: opt.key })}
            className={`btn ${filterState.view === opt.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 13, padding: '6px 16px' }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Overview view */}
      {filterState.view === 'overview' && (
        <>
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
        </>
      )}

      {/* Detailed view */}
      {filterState.view === 'detailed' && (
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Detailed Metrics</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Metric</th>
                  <th style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Current</th>
                  <th style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Previous</th>
                  <th style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {STATS.map((stat) => (
                  <tr key={stat.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 0' }}>{stat.label}</td>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{stat.value}</td>
                    <td style={{ padding: '10px 0', color: '#94a3b8' }}>--</td>
                    <td style={{ padding: '10px 0', color: '#22c55e' }}>{stat.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Activity Breakdown</h3>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {a.user[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14 }}>
                    <Link to={`/dashboard/users/${a.userId}`} style={{ fontWeight: 600, color: '#6366f1' }}>{a.user}</Link>
                    {' '}{a.action}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison view */}
      {filterState.view === 'comparison' && (
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Period Comparison</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Comparing current period vs previous period</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Period</div>
                {STATS.map((stat) => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                    <span style={{ color: '#64748b' }}>{stat.label}</span>
                    <span style={{ fontWeight: 600 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous Period</div>
                {STATS.map((stat) => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                    <span style={{ color: '#64748b' }}>{stat.label}</span>
                    <span style={{ fontWeight: 600, color: '#94a3b8' }}>--</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>Change Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STATS.map((stat) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 14 }}>{stat.label}</div>
                  <div style={{ width: 120, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: '#6366f1', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
