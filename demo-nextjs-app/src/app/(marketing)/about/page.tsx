import Link from "next/link";

export default function AboutPage() {
  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <h1
        style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px" }}
      >
        About Mappd
      </h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--muted)",
          lineHeight: 1.7,
          marginBottom: "24px",
        }}
      >
        Mappd is a developer tool that gives you a visual map of every route,
        layout, and navigation pattern in your Next.js application. No more
        guessing how your pages connect or which layouts wrap which routes.
      </p>

      <h2
        style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}
      >
        Why Mappd?
      </h2>
      <p
        style={{
          color: "var(--muted)",
          lineHeight: 1.7,
          marginBottom: "24px",
        }}
      >
        Modern Next.js apps use the App Router with nested layouts, route
        groups, parallel routes, and intercepting routes. As your app grows,
        it becomes harder to understand how everything fits together. Mappd
        solves this by automatically analyzing your file structure and
        rendering an interactive graph of your entire routing tree.
      </p>

      <h2
        style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}
      >
        How it Works
      </h2>
      <ul
        style={{
          color: "var(--muted)",
          lineHeight: 1.8,
          marginBottom: "24px",
          paddingLeft: "20px",
          listStyleType: "disc",
        }}
      >
        <li>Scans your App Router file structure</li>
        <li>Identifies layouts, pages, route groups, and dynamic segments</li>
        <li>Detects navigation patterns (Link, useRouter, redirect)</li>
        <li>Renders an interactive, zoomable route graph</li>
        <li>Updates in real-time as you add or change routes</li>
      </ul>

      <h2
        style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}
      >
        Built for Developers
      </h2>
      <p
        style={{
          color: "var(--muted)",
          lineHeight: 1.7,
          marginBottom: "32px",
        }}
      >
        Mappd integrates directly into your development workflow. It runs as
        a browser DevTools panel or a standalone dashboard, so you can see
        your route map right alongside your app as you build.
      </p>

      <Link
        href="/pricing"
        style={{
          display: "inline-block",
          background: "var(--primary)",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        View Pricing
      </Link>
    </div>
  );
}
