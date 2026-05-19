"use client";

import { useState } from "react";
import { Tabs } from "@/ui/tabs";
import { StatCard } from "@/ui/stat-card";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";

const analyticsTabs = [
  { key: "overview", label: "Overview" },
  { key: "traffic", label: "Traffic" },
  { key: "conversions", label: "Conversions" },
];

const topPages = [
  { path: "/", views: "12,847", bounce: "32%", trend: "up" },
  { path: "/pricing", views: "8,392", bounce: "18%", trend: "up" },
  { path: "/login", views: "6,103", bounce: "45%", trend: "down" },
  { path: "/about", views: "3,291", bounce: "22%", trend: "up" },
  { path: "/contact", views: "1,847", bounce: "38%", trend: "down" },
];

const trafficSources = [
  { source: "Direct", visitors: "4,281", pct: 42 },
  { source: "Google Search", visitors: "2,847", pct: 28 },
  { source: "Twitter / X", visitors: "1,293", pct: 13 },
  { source: "GitHub", visitors: "982", pct: 10 },
  { source: "Other", visitors: "712", pct: 7 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-primary">Analytics</h1>
        <p className="text-xs text-tertiary mt-0.5">Last 30 days performance</p>
      </div>

      <Tabs tabs={analyticsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Page Views" value="32,487" change="+24%" />
        <StatCard label="Unique Visitors" value="10,115" change="+12%" />
        <StatCard label="Avg. Session" value="2m 34s" change="+8%" />
        <StatCard label="Bounce Rate" value="28.4%" change="-3.2%" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Top Pages</Card.Title>
            <Card.Description>Most visited pages this month</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between py-2 border-b border-surface-border-subtle last:border-0">
                  <div>
                    <p className="text-sm font-medium text-primary font-mono">{page.path}</p>
                    <p className="text-xs text-tertiary">{page.views} views</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">{page.bounce} bounce</span>
                    <Badge variant={page.trend === "up" ? "success" : "error"}>
                      {page.trend === "up" ? "+" : "-"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>

        {/* Traffic Sources */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Traffic Sources</Card.Title>
            <Card.Description>Where your visitors come from</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {trafficSources.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{src.source}</p>
                    <p className="text-xs text-tertiary">{src.visitors} ({src.pct}%)</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-overlay overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
