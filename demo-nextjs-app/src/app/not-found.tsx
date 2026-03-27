import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 60px)",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 800,
          color: "var(--primary)",
          marginBottom: "8px",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--muted)",
          marginBottom: "24px",
          maxWidth: "400px",
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          href="/"
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Go Home
        </Link>
        <Link
          href="/about"
          style={{
            border: "1px solid var(--border)",
            padding: "10px 24px",
            borderRadius: "6px",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          About
        </Link>
      </div>
    </div>
  );
}
