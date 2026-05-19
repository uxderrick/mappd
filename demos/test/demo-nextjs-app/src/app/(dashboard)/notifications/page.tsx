import Link from "next/link";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/utils";

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
  type: (["info", "success", "warning", "error"] as const)[i % 4],
}));

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Notifications</h1>
          <p className="text-xs text-tertiary mt-0.5">{unreadCount} unread</p>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={`/users/${n.userId}`}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              n.read
                ? "border-surface-border-subtle bg-surface-card opacity-60 hover:opacity-80"
                : "border-surface-border bg-surface-raised hover:bg-surface-hover/50",
            )}
          >
            <div className="flex items-center gap-3">
              {!n.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
              <p className={cn("text-sm", n.read ? "text-secondary" : "text-primary font-medium")}>
                {n.message}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Badge variant={n.type}>{n.type}</Badge>
              <span className="text-xs text-tertiary whitespace-nowrap">{n.time}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-tertiary py-4">End of notifications</p>
    </div>
  );
}
