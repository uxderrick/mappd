import Link from "next/link";

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Engineering Lead" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Product Designer" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "Backend Engineer" },
  { id: 4, name: "David Brown", email: "david@example.com", role: "Frontend Engineer" },
  { id: 5, name: "Eve Davis", email: "eve@example.com", role: "QA Engineer" },
];

export default function UsersPage() {
  return (
    <div>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}
      >
        Users
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
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
              <p style={{ fontWeight: 500 }}>{user.name}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {user.email}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {user.role}
              </p>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
