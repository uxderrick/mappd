import Link from "next/link";
import { Button } from "@/ui/button";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">About Acme</h1>
        <p className="text-base text-secondary mt-3 leading-relaxed">
          Acme Platform is a modern SaaS dashboard built for teams who ship fast.
          We provide analytics, user management, and billing tools in a single,
          clean interface.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">Why Acme?</h2>
        <p className="text-sm text-secondary leading-relaxed">
          Modern teams need modern tools. Acme brings together the essential
          building blocks of any SaaS product — user management, analytics,
          billing, and notifications — into one cohesive platform.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">Features</h2>
        <ul className="space-y-2 text-sm text-secondary">
          <li className="flex items-center gap-2"><span className="text-success">&#10003;</span> Real-time analytics dashboard</li>
          <li className="flex items-center gap-2"><span className="text-success">&#10003;</span> Team management with roles</li>
          <li className="flex items-center gap-2"><span className="text-success">&#10003;</span> Subscription billing and invoices</li>
          <li className="flex items-center gap-2"><span className="text-success">&#10003;</span> Smart notification system</li>
          <li className="flex items-center gap-2"><span className="text-success">&#10003;</span> Dark and light theme</li>
        </ul>
      </div>

      <Link href="/pricing">
        <Button variant="primary" size="lg">View Pricing</Button>
      </Link>
    </div>
  );
}
