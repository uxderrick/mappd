"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gear,
  Users,
  Bell,
  House,
  CreditCard,
  ChartLine,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: House },
  { href: "/analytics", label: "Analytics", icon: ChartLine },
  { href: "/users", label: "Users", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Gear },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-var(--dm-header-height))]">
      {/* Sidebar */}
      <aside className="w-[var(--dm-sidebar-width)] shrink-0 border-r border-surface-border bg-surface-raised flex flex-col">
        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary px-3">
            Navigation
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-surface-hover text-primary font-semibold"
                    : "text-secondary hover:bg-surface-hover/50 hover:text-primary",
                )}
              >
                <Icon size={16} weight={isActive ? "fill" : "bold"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
