import Link from "next/link";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

const usersData: Record<string, { name: string; email: string; role: string; bio: string; joined: string; status: string }> = {
  "1": { name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", bio: "Alice leads the engineering team with 8 years of experience in full-stack development.", joined: "Jan 2022", status: "active" },
  "2": { name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", bio: "Bob crafts intuitive user experiences with a background in visual design and research.", joined: "Mar 2022", status: "active" },
  "3": { name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", bio: "Carol builds scalable APIs and services, specializing in distributed systems.", joined: "Jun 2022", status: "active" },
  "4": { name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", bio: "David creates responsive and performant web interfaces using React and Next.js.", joined: "Sep 2022", status: "inactive" },
  "5": { name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", bio: "Eve ensures product quality through comprehensive testing and automation.", joined: "Nov 2022", status: "active" },
  "6": { name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", bio: "Frank manages CI/CD pipelines and cloud infrastructure.", joined: "Jan 2023", status: "active" },
  "7": { name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", bio: "Grace drives product strategy and roadmap planning.", joined: "Feb 2023", status: "pending" },
  "8": { name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", bio: "Henry transforms raw data into actionable business insights.", joined: "Apr 2023", status: "active" },
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = usersData[id];

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-primary">User Not Found</h1>
        <p className="text-sm text-tertiary">No user found with ID {id}.</p>
        <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>
      </div>
    );
  }

  const statusVariant = user.status === "active" ? "success" : user.status === "pending" ? "warning" : "error";

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>

      <Card.Root>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-overlay flex items-center justify-center text-base font-semibold text-secondary">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <Card.Title className="text-base">{user.name}</Card.Title>
                <p className="text-xs text-brand font-medium">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant as "success" | "warning" | "error"}>{user.status}</Badge>
              <Link href={`/users/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Email</p>
              <p className="text-sm text-primary">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Joined</p>
              <p className="text-sm text-primary">{user.joined}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Bio</p>
              <p className="text-sm text-secondary leading-relaxed">{user.bio}</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
