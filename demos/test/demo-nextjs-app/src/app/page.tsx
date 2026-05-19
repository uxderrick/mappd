import Link from "next/link";
import { Button } from "@/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6 text-center">
      <h1 className="text-4xl font-bold text-primary leading-tight max-w-xl">
        Build faster with
        <br />
        <span className="text-brand">Acme Platform</span>
      </h1>
      <p className="text-lg text-secondary max-w-md mt-4 leading-relaxed">
        The modern dashboard for teams who ship. Analytics, user management, and billing in one place.
      </p>
      <div className="flex gap-3 mt-8">
        <Link href="/login">
          <Button variant="primary" size="lg">Get Started</Button>
        </Link>
        <Link href="/about">
          <Button variant="outline" size="lg">Learn More</Button>
        </Link>
      </div>
    </div>
  );
}
