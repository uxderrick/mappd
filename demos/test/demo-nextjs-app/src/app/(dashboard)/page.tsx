"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/ui/stat-card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12%" },
  { label: "Active Sessions", value: "384", change: "+5%" },
  { label: "Revenue", value: "$48,290", change: "+18%" },
  { label: "Conversion Rate", value: "3.24%", change: "-0.4%" },
];

const recentActivity = [
  { id: 1, user: "Alice Johnson", action: "Deployed v2.4.1", time: "2 min ago", status: "success" as const },
  { id: 2, user: "Bob Smith", action: "Updated billing plan", time: "15 min ago", status: "info" as const },
  { id: 3, user: "Carol Williams", action: "Failed login attempt", time: "1 hr ago", status: "error" as const },
  { id: 4, user: "David Brown", action: "Created new API key", time: "2 hr ago", status: "warning" as const },
  { id: 5, user: "Eve Davis", action: "Exported user data", time: "3 hr ago", status: "success" as const },
];

const teamMembers = [
  { id: 1, name: "Alice Johnson", role: "Engineering Lead", status: "online" },
  { id: 2, name: "Bob Smith", role: "Product Designer", status: "away" },
  { id: 3, name: "Carol Williams", role: "Backend Engineer", status: "online" },
  { id: 4, name: "David Brown", role: "Frontend Engineer", status: "offline" },
];

export default function DashboardHome() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("Dashboard mounted");
    localStorage.setItem("lastVisited", "/dashboard");

    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((res) => res.json())
      .then((data) => console.log("Fetched posts:", data.length))
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Overview</h1>
          <p className="text-xs text-tertiary mt-0.5">Welcome back, Derrick</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Activity — 3 cols */}
        <Card.Root className="col-span-3">
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
            <Card.Description>Latest events across your workspace</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-border-subtle last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-xs font-semibold text-secondary">
                      {item.user.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{item.user}</p>
                      <p className="text-xs text-tertiary">{item.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.status}>{item.status}</Badge>
                    <span className="text-xs text-tertiary">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>

        {/* Team — 2 cols */}
        <Card.Root className="col-span-2">
          <Card.Header>
            <Card.Title>Team</Card.Title>
            <Card.Description>{teamMembers.length} members</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/users/${member.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-xs font-semibold text-secondary">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${
                          member.status === "online" ? "bg-success" :
                          member.status === "away" ? "bg-warning" : "bg-tertiary"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{member.name}</p>
                      <p className="text-xs text-tertiary">{member.role}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface-card border border-surface-border rounded-xl p-6 max-w-sm w-full animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-primary mb-2">Quick Action</h3>
            <p className="text-sm text-tertiary mb-4">
              This modal demonstrates useState toggling on the dashboard.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowModal(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
