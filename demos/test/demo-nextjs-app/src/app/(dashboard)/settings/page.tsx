"use client";

import { useState, useEffect } from "react";

type Tab = "general" | "notifications" | "security";

const tabs: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("general");

  useEffect(() => {
    console.log("Settings tab switched to:", activeTab);

    fetch(`https://jsonplaceholder.typicode.com/users/1`)
      .then((res) => res.json())
      .then((data) => {
        console.log(`Settings data for ${activeTab} tab:`, data.name);
      })
      .catch((err) => {
        console.error("Failed to fetch settings data:", err);
      });
  }, [activeTab]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <div>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}
      >
        Settings
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              background: "transparent",
              color:
                activeTab === tab.key ? "var(--primary)" : "var(--muted)",
              fontWeight: activeTab === tab.key ? 600 : 400,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              defaultValue="Derrick Tsorme"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              defaultValue="derrick@example.com"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              Timezone
            </label>
            <select
              defaultValue="UTC"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Email notifications", description: "Receive email updates for important events" },
            { label: "Push notifications", description: "Get push notifications on your device" },
            { label: "Weekly digest", description: "Receive a weekly summary of activity" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--card-bg)",
              }}
            >
              <div>
                <p style={{ fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {item.description}
                </p>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                marginBottom: "4px",
                fontSize: "0.875rem",
              }}
            >
              Two-Factor Authentication
            </label>
            <button
              style={{
                padding: "10px 20px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--card-bg)",
                color: "var(--foreground)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Enable 2FA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
