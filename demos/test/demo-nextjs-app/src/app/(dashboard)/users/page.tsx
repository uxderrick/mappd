"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", status: "active" as const },
  { id: 2, name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", status: "active" as const },
  { id: 3, name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", status: "active" as const },
  { id: 4, name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", status: "inactive" as const },
  { id: 5, name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", status: "active" as const },
  { id: 6, name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", status: "active" as const },
  { id: 7, name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", status: "pending" as const },
  { id: 8, name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", status: "active" as const },
];

const statusVariant = {
  active: "success",
  inactive: "error",
  pending: "warning",
} as const;

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Users</h1>
          <p className="text-xs text-tertiary mt-0.5">{users.length} team members</p>
        </div>
        <Button variant="primary" size="sm">Invite User</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-lg border pl-8 pr-3 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30"
        />
      </div>

      {/* Table */}
      <Card.Root className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Role</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-tertiary px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-surface-border-subtle last:border-0 hover:bg-surface-hover/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="hover:underline">
                    <p className="font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-tertiary">{user.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{user.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/users/${user.id}/edit`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-secondary hover:bg-surface-hover hover:text-primary transition-all"
                  >
                    <PencilSimple size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Root>
    </div>
  );
}
