"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/", label: "Dashboard", icon: "\u25A0" },
  { href: "/settings", label: "Settings", icon: "\u2699" },
  { href: "/users", label: "Users", icon: "\u263A" },
  { href: "/notifications", label: "Notifications", icon: "\u266A" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      <aside
        style={{
          width: "240px",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          padding: "16px 12px",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "12px",
            padding: "0 8px",
          }}
        >
          Navigation
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "var(--active-bg)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--foreground)",
                  fontSize: "0.9rem",
                }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div style={{ flex: 1, padding: "24px" }}>{children}</div>
    </div>
  );
}
