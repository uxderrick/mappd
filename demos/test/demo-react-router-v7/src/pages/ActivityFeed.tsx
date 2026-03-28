import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface ActivityItem {
  id: number
  user: string
  action: string
  target: string
  time: string
  type: 'commit' | 'review' | 'deploy' | 'comment' | 'merge'
}

// Simulates lazy-loaded content — page grows after mount
export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const feed: ActivityItem[] = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        user: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'][i % 5],
        action: ['pushed to', 'reviewed', 'deployed', 'commented on', 'merged'][i % 5],
        target: [`feature/auth-v${i}`, 'main', `fix/bug-${i * 3}`, `PR #${i + 100}`, `release/v1.${i}`][i % 5],
        time: i < 5 ? `${(i + 1) * 10} min ago` : i < 15 ? `${Math.floor(i / 2)} hours ago` : `${i - 14} days ago`,
        type: (['commit', 'review', 'deploy', 'comment', 'merge'] as const)[i % 5],
      }))
      setItems(feed)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const typeColors: Record<string, string> = {
    commit: '#6366f1',
    review: '#f59e0b',
    deploy: '#10b981',
    comment: '#64748b',
    merge: '#8b5cf6',
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Activity Feed</h2>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{items.length} events</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading activity...</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            background: '#fff', borderBottom: '1px solid #f1f5f9',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: typeColors[item.type], flexShrink: 0,
            }} />
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>{item.user}</strong> {item.action} <code style={{ fontSize: 12, background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>{item.target}</code>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{item.time}</span>
          </div>
        ))}
      </div>

      {!loading && (
        <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>
          End of activity feed
        </div>
      )}
    </div>
  )
}
