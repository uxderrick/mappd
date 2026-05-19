"use client";

import { useState } from "react";
import { Tabs } from "@/ui/tabs";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const settingsTabs = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-primary">Settings</h1>
        <p className="text-xs text-tertiary mt-0.5">Manage your account preferences</p>
      </div>

      <Tabs tabs={settingsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "general" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>Your personal information</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input label="Display Name" id="name" defaultValue="Derrick Tsorme" />
              <Input label="Email" id="email" type="email" defaultValue="derrick@acme.com" />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tz" className="text-xs font-medium text-secondary">Timezone</label>
                <select
                  id="tz"
                  defaultValue="UTC"
                  className="w-full h-9 rounded-lg border px-3 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">Save Changes</Button>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      )}

      {activeTab === "notifications" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
            <Card.Description>Choose what you want to be notified about</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[
                { label: "Email notifications", desc: "Receive email updates for important events" },
                { label: "Push notifications", desc: "Get push notifications on your device" },
                { label: "Weekly digest", desc: "Receive a weekly summary of activity" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-surface-border-subtle">
                  <div>
                    <p className="text-sm font-medium text-primary">{item.label}</p>
                    <p className="text-xs text-tertiary">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand" />
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      )}

      {activeTab === "security" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Security</Card.Title>
            <Card.Description>Manage your password and authentication</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input label="Current Password" id="current-pw" type="password" placeholder="Enter current password" />
              <Input label="New Password" id="new-pw" type="password" placeholder="Enter new password" />
              <div className="flex items-center justify-between p-3 rounded-lg border border-surface-border-subtle">
                <div>
                  <p className="text-sm font-medium text-primary">Two-Factor Authentication</p>
                  <p className="text-xs text-tertiary">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">Update Password</Button>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      )}
    </div>
  );
}
