import Link from "next/link";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and exploring.",
    features: ["Up to 3 users", "Basic analytics", "Community support", "1 GB storage"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing teams and serious projects.",
    features: ["Up to 25 users", "Advanced analytics", "Priority support", "50 GB storage", "API access", "Custom integrations"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For organizations with advanced needs.",
    features: ["Unlimited users", "Custom analytics", "Dedicated support", "Unlimited storage", "SSO & SAML", "SLA guarantee"],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="px-6 py-12 text-center">
      <h1 className="text-2xl font-bold text-primary">Simple Pricing</h1>
      <p className="text-base text-secondary mt-2">Choose the plan that fits your team.</p>

      <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "rounded-xl p-6 text-left relative",
              tier.highlighted
                ? "bg-surface-card border-2 border-brand"
                : "bg-surface-card border border-surface-border",
            )}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-on-brand px-3 py-0.5 rounded-full text-[11px] font-semibold">
                Most Popular
              </span>
            )}
            <h2 className="text-lg font-semibold text-primary">{tier.name}</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold text-primary">{tier.price}</span>
              <span className="text-sm text-tertiary ml-1">{tier.period}</span>
            </div>
            <p className="text-sm text-secondary mt-2 leading-relaxed">{tier.description}</p>
            <ul className="mt-5 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="text-sm text-secondary flex items-center gap-2">
                  <span className="text-success text-xs">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block mt-6">
              <Button
                variant={tier.highlighted ? "primary" : "outline"}
                className="w-full"
                size="md"
              >
                {tier.highlighted ? "Start Free Trial" : "Get Started"}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
