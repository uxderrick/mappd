import { Link } from "react-router-dom";

// Generate 30 notifications for scroll testing
const NOTIFICATIONS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: [
    "Derrick commented on your post",
    "Bob invited you to a project",
    "Charlie liked your update",
    "System maintenance scheduled",
    "New feature: Team Analytics",
    "Alice completed the design review",
    "Deployment succeeded on production",
    "Your report has been generated",
    "New team member joined",
    "Sprint retrospective scheduled",
    "Code review requested",
    "Bug report assigned to you",
    "Weekly digest available",
    "Account security update",
    "API usage approaching limit",
  ][i % 15],
  time: i < 3 ? `${(i + 1) * 5} min ago` : i < 10 ? `${i} hours ago` : `${i - 9} days ago`,
  read: i >= 5,
  userId: i % 4 === 3 ? null : (i % 3) + 1,
}));

export default function NotificationsPage() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Notifications</h2>
        <span style={{ fontSize: 12, color: "#64748b" }}>{unreadCount} unread</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }}>All</button>
        <button className="btn" style={{ fontSize: 12, padding: "4px 12px", background: "#e2e8f0", color: "#1e293b" }}>Unread ({unreadCount})</button>
        <button className="btn" style={{ fontSize: 12, padding: "4px 12px", background: "#e2e8f0", color: "#1e293b" }}>Mentions</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="card" style={{ padding: "12px 16px", opacity: n.read ? 0.6 : 1, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!n.read && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                  )}
                  <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 14 }}>{n.title}</div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, marginLeft: n.read ? 0 : 14 }}>{n.time}</div>
              </div>
              {n.userId && (
                <Link to={`/dashboard/users/${n.userId}`} style={{ fontSize: 12, color: "#6366f1", flexShrink: 0 }}>
                  View Profile
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
        You've reached the end of your notifications
      </div>
    </div>
  );
}
