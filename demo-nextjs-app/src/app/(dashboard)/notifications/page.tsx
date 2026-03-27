import Link from "next/link";

const notifications = [
  {
    id: 1,
    message: "Alice Johnson commented on your pull request",
    userId: 1,
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    message: "Bob Smith shared a new design file",
    userId: 2,
    time: "15 minutes ago",
    read: false,
  },
  {
    id: 3,
    message: "Carol Williams deployed the latest build",
    userId: 3,
    time: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    message: "David Brown requested a code review",
    userId: 4,
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    message: "Eve Davis reported a test failure",
    userId: 5,
    time: "5 hours ago",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}
      >
        Notifications
      </h1>
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
              background: notification.read
                ? "var(--card-bg)"
                : "var(--active-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {!notification.read && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    flexShrink: 0,
                  }}
                />
              )}
              <p style={{ fontWeight: notification.read ? 400 : 500 }}>
                {notification.message}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                whiteSpace: "nowrap",
                marginLeft: "16px",
              }}
            >
              {notification.time}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
