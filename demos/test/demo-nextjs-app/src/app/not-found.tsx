import Link from "next/link";
import { Button } from "@/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6 text-center">
      <h1 className="text-6xl font-bold text-brand">404</h1>
      <h2 className="text-xl font-semibold text-primary mt-2">Page Not Found</h2>
      <p className="text-sm text-tertiary mt-2 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 mt-6">
        <Link href="/"><Button variant="primary" size="sm">Go Home</Button></Link>
        <Link href="/about"><Button variant="outline" size="sm">About</Button></Link>
      </div>
    </div>
  );
}
