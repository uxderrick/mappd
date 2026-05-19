"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const usersData: Record<string, { name: string; email: string; role: string; bio: string }> = {
  "1": { name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", bio: "Alice leads the engineering team with 8 years of experience." },
  "2": { name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", bio: "Bob crafts intuitive user experiences." },
  "3": { name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", bio: "Carol builds scalable APIs and services." },
  "4": { name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", bio: "David creates responsive web interfaces." },
  "5": { name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", bio: "Eve ensures product quality through testing." },
  "6": { name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", bio: "Frank manages CI/CD pipelines." },
  "7": { name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", bio: "Grace drives product strategy." },
  "8": { name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", bio: "Henry transforms data into insights." },
};

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const user = usersData[id];

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-primary">User Not Found</h1>
        <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Saving user:", { id, name, email, role, bio });
    router.push(`/users/${id}`);
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Link href={`/users/${id}`} className="text-sm font-medium text-brand hover:underline">&larr; Back to {user.name}</Link>

      <Card.Root>
        <Card.Header>
          <Card.Title>Edit User</Card.Title>
          <Card.Description>Update user information</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Role" id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-xs font-medium text-secondary">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
