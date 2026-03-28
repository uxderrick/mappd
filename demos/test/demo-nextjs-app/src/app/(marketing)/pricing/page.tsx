import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and exploring Mappd.",
    features: [
      "Up to 20 routes",
      "Basic route visualization",
      "File structure scanning",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professional developers and growing apps.",
    features: [
      "Unlimited routes",
      "Interactive route graph",
      "Navigation pattern detection",
      "Real-time updates",
      "Layout & route group analysis",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For teams collaborating on large applications.",
    features: [
      "Everything in Pro",
      "Team sharing & collaboration",
      "Route change history",
      "CI/CD integration",
      "Custom export formats",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
        Simple, Transparent Pricing
      </h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--muted)",
          marginBottom: "40px",
        }}
      >
        Choose the plan that fits your project.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              padding: "32px 24px",
              border: tier.highlighted
                ? "2px solid var(--primary)"
                : "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--card-bg)",
              textAlign: "left",
              position: "relative",
            }}
          >
            {tier.highlighted && (
              <span
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--primary)",
                  color: "#fff",
                  padding: "2px 12px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Most Popular
              </span>
            )}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {tier.name}
            </h2>
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800 }}>
                {tier.price}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  marginLeft: "4px",
                }}
              >
                {tier.period}
              </span>
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}
            >
              {tier.description}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  style={{ fontSize: "0.9rem", color: "var(--foreground)" }}
                >
                  &#10003; {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: 600,
                background: tier.highlighted
                  ? "var(--primary)"
                  : "transparent",
                color: tier.highlighted ? "#fff" : "var(--primary)",
                border: tier.highlighted
                  ? "none"
                  : "1px solid var(--primary)",
              }}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
