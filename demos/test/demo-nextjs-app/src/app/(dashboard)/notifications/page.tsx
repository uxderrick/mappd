import Link from "next/link";

// 25 notifications for scroll testing
const notifications = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  message: [
    "Alice Johnson commented on your pull request",
    "Bob Smith shared a new design file",
    "Carol Williams deployed the latest build",
    "David Brown requested a code review",
    "Eve Davis reported a test failure",
    "Frank Garcia merged branch feature/auth",
    "Grace Lee created a new project",
    "Henry Wilson assigned you a task",
    "Ivy Chen updated the documentation",
    "Jack Martin closed issue #42",
  ][i % 10],
  userId: (i % 5) + 1,
  time: i < 3 ? `${(i + 1) * 5} min ago` : i < 10 ? `${i} hours ago` : `${i - 9} days ago`,
  read: i >= 4,
}));

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Notifications</h1>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{unreadCount} unread</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={`/users/${notification.userId}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: notification.read ? "var(--card-bg)" : "var(--active-bg)",
              opacity: notification.read ? 0.7 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {!notification.read && (
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
              )}
              <p style={{ fontWeight: notification.read ? 400 : 500, margin: 0 }}>{notification.message}</p>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap", marginLeft: "16px" }}>
              {notification.time}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: "0.85rem" }}>
        End of notifications
      </div>
    </div>
  );
}
