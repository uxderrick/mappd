import Link from "next/link";

const usersData: Record<string, { name: string; email: string; role: string; bio: string; joined: string }> = {
  "1": {
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Engineering Lead",
    bio: "Alice leads the engineering team with 8 years of experience in full-stack development.",
    joined: "January 2022",
  },
  "2": {
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Product Designer",
    bio: "Bob crafts intuitive user experiences and has a background in visual design and user research.",
    joined: "March 2022",
  },
  "3": {
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Backend Engineer",
    bio: "Carol builds scalable APIs and services, specializing in distributed systems.",
    joined: "June 2022",
  },
  "4": {
    name: "David Brown",
    email: "david@example.com",
    role: "Frontend Engineer",
    bio: "David creates responsive and performant web interfaces using React and Next.js.",
    joined: "September 2022",
  },
  "5": {
    name: "Eve Davis",
    email: "eve@example.com",
    role: "QA Engineer",
    bio: "Eve ensures product quality through comprehensive testing strategies and automation.",
    joined: "November 2022",
  },
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = usersData[id];

  if (!user) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "16px" }}>
          User Not Found
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
          No user found with ID {id}.
        </p>
        <Link
          href="/users"
          style={{
            color: "var(--primary)",
            fontWeight: 500,
          }}
        >
          &larr; Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/users"
        style={{
          color: "var(--primary)",
          fontWeight: 500,
          display: "inline-block",
          marginBottom: "24px",
          fontSize: "0.9rem",
        }}
      >
        &larr; Back to Users
      </Link>

      <div
        style={{
          padding: "24px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "var(--card-bg)",
          maxWidth: "600px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }}>
          {user.name}
        </h1>
        <p style={{ color: "var(--primary)", fontWeight: 500, marginBottom: "16px" }}>
          {user.role}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "2px",
              }}
            >
              Email
            </p>
            <p>{user.email}</p>
          </div>
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "2px",
              }}
            >
              Joined
            </p>
            <p>{user.joined}</p>
          </div>
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "2px",
              }}
            >
              Bio
            </p>
            <p style={{ lineHeight: 1.6 }}>{user.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
