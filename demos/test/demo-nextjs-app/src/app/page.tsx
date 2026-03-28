import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 60px)",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 800,
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        Navigate your app
        <br />
        <span style={{ color: "var(--primary)" }}>with confidence</span>
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          color: "var(--muted)",
          maxWidth: "560px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        Mappd gives you a visual map of every route, layout, and navigation
        pattern in your Next.js app. Understand your app at a glance.
      </p>
      <div style={{ display: "flex", gap: "16px" }}>
        <Link
          href="/login"
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Get Started
        </Link>
        <Link
          href="/about"
          style={{
            border: "1px solid var(--border)",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "1rem",
            color: "var(--foreground)",
          }}
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
