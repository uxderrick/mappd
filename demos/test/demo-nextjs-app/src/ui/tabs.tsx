"use client";

import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-0.5 rounded-lg",
        "bg-surface-overlay border border-surface-border-subtle",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "h-7 px-3 rounded-md text-xs font-medium transition-all outline-none",
            activeTab === tab.key
              ? "bg-surface-raised text-primary shadow-sm"
              : "text-tertiary hover:text-secondary",
          )}
        >
          {tab.label}
          {tab.badge != null && (
            <span className="ml-1.5 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full bg-badge-amber-bg text-badge-amber">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
