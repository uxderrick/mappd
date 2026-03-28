"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12%" },
  { label: "Active Sessions", value: "384", change: "+5%" },
  { label: "Revenue", value: "$48,290", change: "+18%" },
  { label: "Conversion Rate", value: "3.24%", change: "-0.4%" },
];

const teamMembers = [
  { id: 1, name: "Alice Johnson", role: "Engineering Lead" },
  { id: 2, name: "Bob Smith", role: "Product Designer" },
  { id: 3, name: "Carol Williams", role: "Backend Engineer" },
];

export default function DashboardHome() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("Dashboard mounted");
    console.info("Dashboard info: page loaded at", new Date().toISOString());
    console.warn("Dashboard warning: this is a demo environment");

    localStorage.setItem("lastVisited", "/dashboard");
    localStorage.setItem(
      "dashboardLoadTime",
      new Date().toISOString()
    );

    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched posts:", data.length);
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
      });
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Quick Action
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "20px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--card-bg)",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--muted)",
                marginBottom: "4px",
              }}
            >
              {stat.label}
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stat.value}</p>
            <p
              style={{
                fontSize: "0.8rem",
                color: stat.change.startsWith("+")
                  ? "var(--success)"
                  : "var(--danger)",
                marginTop: "4px",
              }}
            >
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <h2
        style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "12px" }}
      >
        Team Members
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {teamMembers.map((member) => (
          <Link
            key={member.id}
            href={`/users/${member.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--card-bg)",
            }}
          >
            <div>
              <p style={{ fontWeight: 500 }}>{member.name}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {member.role}
              </p>
            </div>
            <span style={{ color: "var(--muted)" }}>&rarr;</span>
          </Link>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Quick Action
            </h3>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
              This modal demonstrates useState toggling on the dashboard.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "8px 16px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
