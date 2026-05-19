import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Dashboard",
  description: "A Next.js App Router demo for Mappd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Dev-only: unregister any stale service workers left over from previous apps on this port */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){});if(window.caches){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}).catch(function(){})}}`,
          }}
        />
        <nav className="flex items-center justify-between px-6 h-[var(--dm-header-height)] border-b border-surface-border bg-surface-base sticky top-0 z-50">
          <Link href="/" className="font-bold text-lg text-brand">
            Acme
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Contact
            </Link>
            <Link
              href="/login"
              className="h-8 px-4 rounded-lg text-xs font-semibold bg-brand text-on-brand hover:bg-brand-hover transition-all inline-flex items-center"
            >
              Sign In
            </Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
