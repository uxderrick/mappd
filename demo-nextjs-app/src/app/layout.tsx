import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mappd Demo App",
  description: "A Next.js App Router demo for Mappd DevTools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--background)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Link
            href="/"
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--primary)",
            }}
          >
            Mappd Demo
          </Link>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link
              href="/"
              style={{ color: "var(--foreground)", fontWeight: 500 }}
            >
              Home
            </Link>
            <Link
              href="/about"
              style={{ color: "var(--foreground)", fontWeight: 500 }}
            >
              About
            </Link>
            <Link
              href="/pricing"
              style={{ color: "var(--foreground)", fontWeight: 500 }}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              style={{
                color: "#fff",
                background: "var(--primary)",
                padding: "6px 16px",
                borderRadius: "6px",
                fontWeight: 500,
              }}
            >
              Login
            </Link>
          </div>
        </nav>
        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
