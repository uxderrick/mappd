# Demo Next.js App — Production Dashboard Upgrade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the barebones demo-nextjs-app into a polished, realistic SaaS dashboard that showcases Mappd's route visualization on a real-world-feeling app.

**Architecture:** Migrate from inline styles to Tailwind CSS v4 with a semantic design token system (`--dm-*` prefix) inspired by the partner-dashboard. Keep the same route structure but add 4 new routes for depth. All UI components are local to the demo (no shared library) — simple, single-file components using CVA for variants. Dark-first theme with a blue brand color to differentiate from partner-dashboard's orange.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), CVA (`class-variance-authority`), `clsx` + `tailwind-merge` via `cn()` utility, Phosphor Icons (`@phosphor-icons/react/bold`)

---

## File Structure

### New files to create:
```
src/
├── lib/
│   └── utils.ts                    # cn() utility (clsx + twMerge)
├── ui/
│   ├── button.tsx                  # Button component with CVA variants
│   ├── card.tsx                    # Card compound component
│   ├── badge.tsx                   # Badge with status variants
│   ├── input.tsx                   # Styled input
│   ├── tabs.tsx                    # Tab group (no Radix — pure CSS)
│   └── stat-card.tsx               # Metric card (label, value, change%)
├── app/
│   ├── (dashboard)/
│   │   ├── analytics/
│   │   │   └── page.tsx            # Analytics page with charts/metrics
│   │   ├── users/
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx    # User edit form
│   │   └── billing/
│   │       └── page.tsx            # Billing/plan page
│   └── (marketing)/
│       └── contact/
│           └── page.tsx            # Contact form page
postcss.config.mjs                  # Tailwind v4 PostCSS plugin
```

### Existing files to modify:
```
package.json                        # Add tailwind, cva, clsx, twMerge, phosphor
src/app/globals.css                 # Full rewrite — design tokens + Tailwind
src/app/layout.tsx                  # Rewrite with Tailwind classes
src/app/page.tsx                    # Restyle home/landing
src/app/not-found.tsx               # Restyle 404
src/app/login/page.tsx              # Restyle login form
src/app/(dashboard)/layout.tsx      # Sidebar with Tailwind + icons
src/app/(dashboard)/page.tsx        # Dashboard with stat cards, table
src/app/(dashboard)/settings/page.tsx     # Settings with proper tabs
src/app/(dashboard)/users/page.tsx        # Users table with search/filter
src/app/(dashboard)/users/[id]/page.tsx   # User detail card
src/app/(dashboard)/notifications/page.tsx # Notifications with badges
src/app/(marketing)/about/page.tsx        # Restyle about
src/app/(marketing)/pricing/page.tsx      # Restyle pricing
```

---

## Task 1: Install dependencies and configure Tailwind CSS v4

**Files:**
- Modify: `demos/test/demo-nextjs-app/package.json`
- Create: `demos/test/demo-nextjs-app/postcss.config.mjs`

- [ ] **Step 1: Install Tailwind CSS v4 and dependencies**

```bash
cd demos/test/demo-nextjs-app
npm install tailwindcss @tailwindcss/postcss class-variance-authority clsx tailwind-merge @phosphor-icons/react
```

- [ ] **Step 2: Create PostCSS config**

Create `demos/test/demo-nextjs-app/postcss.config.mjs`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 3: Verify Tailwind compiles**

Run: `cd demos/test/demo-nextjs-app && npx next build`
Expected: Build succeeds (CSS may be empty since we haven't written classes yet, but no PostCSS errors)

- [ ] **Step 4: Commit**

```bash
git add demos/test/demo-nextjs-app/package.json demos/test/demo-nextjs-app/package-lock.json demos/test/demo-nextjs-app/postcss.config.mjs
git commit -m "feat(demo): add Tailwind CSS v4, CVA, and Phosphor Icons"
```

---

## Task 2: Design tokens and globals.css

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/globals.css`
- Delete: `demos/test/demo-nextjs-app/src/app/page.module.css`

- [ ] **Step 1: Write the new globals.css**

Rewrite `demos/test/demo-nextjs-app/src/app/globals.css`:

```css
@import "tailwindcss";

/* ==================== Tailwind v4 Theme — Animations ==================== */

@theme {
  --animate-fade-in-up: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-fade-in-scale: fade-in-scale 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-card-in: card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-modal-enter: modal-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  --animate-modal-exit: modal-exit 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-skeleton-pulse: skeleton-pulse 1.5s ease-in-out infinite;
}

/* ==================== Semantic Tokens → Tailwind utilities ==================== */

@theme inline {
  /* Surfaces */
  --color-surface-base: var(--dm-surface-base);
  --color-surface-raised: var(--dm-surface-raised);
  --color-surface-card: var(--dm-surface-card);
  --color-surface-overlay: var(--dm-surface-overlay);
  --color-surface-input: var(--dm-surface-input);
  --color-surface-hover: var(--dm-surface-hover);
  --color-surface-border: var(--dm-surface-border);
  --color-surface-border-subtle: var(--dm-surface-border-subtle);

  /* Text */
  --color-primary: var(--dm-text-primary);
  --color-secondary: var(--dm-text-secondary);
  --color-tertiary: var(--dm-text-tertiary);
  --color-inverse: var(--dm-text-inverse);
  --color-on-brand: var(--dm-text-on-brand);

  /* Brand */
  --color-brand: var(--dm-brand);
  --color-brand-hover: var(--dm-brand-hover);

  /* Status */
  --color-success: var(--dm-success);
  --color-error: var(--dm-error);
  --color-warning: var(--dm-warning);

  /* Badges */
  --color-badge-green: var(--dm-badge-green);
  --color-badge-green-bg: var(--dm-badge-green-bg);
  --color-badge-amber: var(--dm-badge-amber);
  --color-badge-amber-bg: var(--dm-badge-amber-bg);
  --color-badge-red: var(--dm-badge-red);
  --color-badge-red-bg: var(--dm-badge-red-bg);
  --color-badge-blue: var(--dm-badge-blue);
  --color-badge-blue-bg: var(--dm-badge-blue-bg);

  /* Font */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@layer base {
  *, *::before, *::after {
    border-color: var(--dm-surface-border-subtle);
  }

  html, body {
    width: 100%;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-surface-base text-primary font-sans;
  }

  button:not(:disabled),
  [role='button']:not(:disabled) {
    cursor: pointer;
  }

  :focus-visible {
    outline: none;
  }
}

/* ==================== Design Tokens (dark-first) ==================== */

:root {
  --dm-brand: #3b82f6;
  --dm-brand-hover: #2563eb;

  --dm-surface-base: #09090b;
  --dm-surface-raised: #131316;
  --dm-surface-card: #18181b;
  --dm-surface-overlay: #1e1e22;
  --dm-surface-input: #111114;
  --dm-surface-hover: #242429;
  --dm-surface-border: #27272a;
  --dm-surface-border-subtle: #1c1c1f;

  --dm-text-primary: #fafafa;
  --dm-text-secondary: #a1a1aa;
  --dm-text-tertiary: #71717a;
  --dm-text-inverse: #09090b;
  --dm-text-on-brand: #ffffff;

  --dm-success: #4ade80;
  --dm-error: #f87171;
  --dm-warning: #fbbf24;

  --dm-badge-green: #86efac;
  --dm-badge-green-bg: rgba(74, 222, 128, 0.12);
  --dm-badge-amber: #fcd34d;
  --dm-badge-amber-bg: rgba(251, 191, 36, 0.12);
  --dm-badge-red: #fca5a5;
  --dm-badge-red-bg: rgba(248, 113, 113, 0.12);
  --dm-badge-blue: #93c5fd;
  --dm-badge-blue-bg: rgba(96, 165, 250, 0.12);

  /* Easing */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1);

  /* Layout */
  --dm-sidebar-width: 14rem;
  --dm-header-height: 3.25rem;
}

/* ==================== Light Theme ==================== */

@media (prefers-color-scheme: light) {
  :root {
    --dm-surface-base: #f8f8f8;
    --dm-surface-raised: #f0f0f0;
    --dm-surface-card: #ffffff;
    --dm-surface-overlay: #e8e8e8;
    --dm-surface-input: #ffffff;
    --dm-surface-hover: #dcdcdc;
    --dm-surface-border: #d4d4d8;
    --dm-surface-border-subtle: #e4e4e7;

    --dm-text-primary: #18181b;
    --dm-text-secondary: #52525b;
    --dm-text-tertiary: #71717a;
    --dm-text-inverse: #fafafa;
    --dm-text-on-brand: #ffffff;

    --dm-brand: #2563eb;
    --dm-brand-hover: #1d4ed8;

    --dm-success: #16a34a;
    --dm-error: #dc2626;
    --dm-warning: #d97706;

    --dm-badge-green: #15803d;
    --dm-badge-green-bg: rgba(22, 163, 74, 0.10);
    --dm-badge-amber: #b45309;
    --dm-badge-amber-bg: rgba(180, 83, 9, 0.10);
    --dm-badge-red: #b91c1c;
    --dm-badge-red-bg: rgba(220, 38, 38, 0.10);
    --dm-badge-blue: #2563eb;
    --dm-badge-blue-bg: rgba(37, 99, 235, 0.10);
  }
}

/* ==================== Keyframe Animations ==================== */

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-scale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes modal-exit {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* ==================== Scrollbar ==================== */

::-webkit-scrollbar { width: 0.375rem; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--dm-surface-border); border-radius: 99rem; }
::-webkit-scrollbar-thumb:hover { background: var(--dm-text-tertiary); }

/* ==================== Reduced Motion ==================== */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Delete the unused CSS module**

```bash
rm demos/test/demo-nextjs-app/src/app/page.module.css
```

- [ ] **Step 3: Verify the app still builds**

Run: `cd demos/test/demo-nextjs-app && npx next build`
Expected: Build succeeds (page.module.css import in old page.tsx may error — that's fine, we rewrite it in Task 5)

- [ ] **Step 4: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/globals.css
git rm demos/test/demo-nextjs-app/src/app/page.module.css
git commit -m "feat(demo): add design token system and Tailwind v4 theme"
```

---

## Task 3: cn() utility

**Files:**
- Create: `demos/test/demo-nextjs-app/src/lib/utils.ts`

- [ ] **Step 1: Create the utility**

Create `demos/test/demo-nextjs-app/src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/lib/utils.ts
git commit -m "feat(demo): add cn() utility for className merging"
```

---

## Task 4: UI components — Button, Card, Badge, Input, StatCard, Tabs

**Files:**
- Create: `demos/test/demo-nextjs-app/src/ui/button.tsx`
- Create: `demos/test/demo-nextjs-app/src/ui/card.tsx`
- Create: `demos/test/demo-nextjs-app/src/ui/badge.tsx`
- Create: `demos/test/demo-nextjs-app/src/ui/input.tsx`
- Create: `demos/test/demo-nextjs-app/src/ui/stat-card.tsx`
- Create: `demos/test/demo-nextjs-app/src/ui/tabs.tsx`

- [ ] **Step 1: Create Button**

Create `demos/test/demo-nextjs-app/src/ui/button.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "rounded-lg font-medium transition-all outline-none",
    "active:scale-[0.97] active:duration-75",
    "focus-visible:ring-[3px]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand hover:bg-brand-hover focus-visible:ring-brand/50",
        secondary: "bg-surface-overlay text-secondary hover:bg-surface-hover hover:text-primary focus-visible:ring-brand/50",
        danger: "bg-error text-white hover:opacity-90 focus-visible:ring-error/50",
        ghost: "bg-transparent text-secondary hover:bg-surface-hover hover:text-primary focus-visible:ring-brand/50",
        outline: "bg-transparent border border-surface-border text-secondary hover:bg-surface-hover hover:text-primary focus-visible:ring-brand/50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-sm font-semibold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

- [ ] **Step 2: Create Card**

Create `demos/test/demo-nextjs-app/src/ui/card.tsx`:

```tsx
import { cn } from "@/lib/utils";

function CardRoot({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-surface-border bg-surface-card p-4 text-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 mb-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-primary", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-tertiary", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-3 pt-3 flex items-center border-t border-surface-border-subtle", className)}
      {...props}
    />
  );
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};
```

- [ ] **Step 3: Create Badge**

Create `demos/test/demo-nextjs-app/src/ui/badge.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
  {
    variants: {
      variant: {
        default: "bg-surface-overlay text-secondary border border-surface-border",
        success: "bg-badge-green-bg text-badge-green",
        warning: "bg-badge-amber-bg text-badge-amber",
        error: "bg-badge-red-bg text-badge-red",
        info: "bg-badge-blue-bg text-badge-blue",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

- [ ] **Step 4: Create Input**

Create `demos/test/demo-nextjs-app/src/ui/input.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-9 rounded-lg border px-3 text-sm outline-none transition-all",
          "bg-surface-input border-surface-border text-primary",
          "placeholder:text-tertiary",
          "focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 5: Create StatCard**

Create `demos/test/demo-nextjs-app/src/ui/stat-card.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  className?: string;
}

export function StatCard({ label, value, change, className }: StatCardProps) {
  const isPositive = change.startsWith("+");
  return (
    <div className={cn("rounded-xl border border-surface-border bg-surface-card p-5", className)}>
      <p className="text-xs text-tertiary mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className={cn("text-xs mt-1", isPositive ? "text-success" : "text-error")}>
        {change} from last month
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create Tabs**

Create `demos/test/demo-nextjs-app/src/ui/tabs.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-0.5 rounded-lg",
        "bg-surface-overlay border border-surface-border-subtle",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "h-7 px-3 rounded-md text-xs font-medium transition-all outline-none",
            activeTab === tab.key
              ? "bg-surface-raised text-primary shadow-sm"
              : "text-tertiary hover:text-secondary",
          )}
        >
          {tab.label}
          {tab.badge != null && (
            <span className="ml-1.5 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full bg-badge-amber-bg text-badge-amber">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add demos/test/demo-nextjs-app/src/ui/ demos/test/demo-nextjs-app/src/lib/
git commit -m "feat(demo): add UI component library — Button, Card, Badge, Input, StatCard, Tabs"
```

---

## Task 5: Root layout — nav bar with Tailwind

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/layout.tsx`

- [ ] **Step 1: Rewrite the root layout**

Rewrite `demos/test/demo-nextjs-app/src/app/layout.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify it renders**

Run: `cd demos/test/demo-nextjs-app && npm run dev`
Open: http://localhost:3001
Expected: Nav bar renders with blue "Acme" brand, dark background, styled links

- [ ] **Step 3: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/layout.tsx
git commit -m "feat(demo): restyle root layout with Tailwind nav bar"
```

---

## Task 6: Dashboard sidebar layout

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Rewrite the dashboard layout with Tailwind sidebar**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/layout.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Gear,
  Users,
  Bell,
  House,
  CreditCard,
  ChartLine,
} from "@phosphor-icons/react/bold";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: House },
  { href: "/analytics", label: "Analytics", icon: ChartLine },
  { href: "/users", label: "Users", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Gear },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-var(--dm-header-height))]">
      {/* Sidebar */}
      <aside className="w-[var(--dm-sidebar-width)] shrink-0 border-r border-surface-border bg-surface-raised flex flex-col">
        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary px-3">
            Navigation
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-surface-hover text-primary font-semibold"
                    : "text-secondary hover:bg-surface-hover/50 hover:text-primary",
                )}
              >
                <Icon size={16} weight={isActive ? "fill" : "bold"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify sidebar renders**

Open: http://localhost:3001
Expected: Left sidebar with icons, active state highlighting, content area on the right

- [ ] **Step 3: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/layout.tsx
git commit -m "feat(demo): restyle dashboard sidebar with Tailwind + Phosphor Icons"
```

---

## Task 7: Dashboard home page

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Rewrite the dashboard home page**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/ui/stat-card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12%" },
  { label: "Active Sessions", value: "384", change: "+5%" },
  { label: "Revenue", value: "$48,290", change: "+18%" },
  { label: "Conversion Rate", value: "3.24%", change: "-0.4%" },
];

const recentActivity = [
  { id: 1, user: "Alice Johnson", action: "Deployed v2.4.1", time: "2 min ago", status: "success" as const },
  { id: 2, user: "Bob Smith", action: "Updated billing plan", time: "15 min ago", status: "info" as const },
  { id: 3, user: "Carol Williams", action: "Failed login attempt", time: "1 hr ago", status: "error" as const },
  { id: 4, user: "David Brown", action: "Created new API key", time: "2 hr ago", status: "warning" as const },
  { id: 5, user: "Eve Davis", action: "Exported user data", time: "3 hr ago", status: "success" as const },
];

const teamMembers = [
  { id: 1, name: "Alice Johnson", role: "Engineering Lead", status: "online" },
  { id: 2, name: "Bob Smith", role: "Product Designer", status: "away" },
  { id: 3, name: "Carol Williams", role: "Backend Engineer", status: "online" },
  { id: 4, name: "David Brown", role: "Frontend Engineer", status: "offline" },
];

export default function DashboardHome() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("Dashboard mounted");
    localStorage.setItem("lastVisited", "/dashboard");

    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((res) => res.json())
      .then((data) => console.log("Fetched posts:", data.length))
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Overview</h1>
          <p className="text-xs text-tertiary mt-0.5">Welcome back, Derrick</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Activity — 3 cols */}
        <Card.Root className="col-span-3">
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
            <Card.Description>Latest events across your workspace</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-border-subtle last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-xs font-semibold text-secondary">
                      {item.user.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{item.user}</p>
                      <p className="text-xs text-tertiary">{item.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.status}>{item.status}</Badge>
                    <span className="text-xs text-tertiary">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>

        {/* Team — 2 cols */}
        <Card.Root className="col-span-2">
          <Card.Header>
            <Card.Title>Team</Card.Title>
            <Card.Description>{teamMembers.length} members</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/users/${member.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-xs font-semibold text-secondary">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${
                          member.status === "online" ? "bg-success" :
                          member.status === "away" ? "bg-warning" : "bg-tertiary"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{member.name}</p>
                      <p className="text-xs text-tertiary">{member.role}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface-card border border-surface-border rounded-xl p-6 max-w-sm w-full animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-primary mb-2">Quick Action</h3>
            <p className="text-sm text-tertiary mb-4">
              This modal demonstrates useState toggling on the dashboard.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowModal(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify dashboard renders**

Open: http://localhost:3001
Expected: Stats grid, recent activity table, team members with status dots, all with dark theme

- [ ] **Step 3: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/page.tsx
git commit -m "feat(demo): restyle dashboard home with stat cards, activity feed, and team list"
```

---

## Task 8: Users list page with search

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/users/page.tsx`

- [ ] **Step 1: Rewrite users page**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/users/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, PencilSimple } from "@phosphor-icons/react/bold";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", status: "active" as const },
  { id: 2, name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", status: "active" as const },
  { id: 3, name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", status: "active" as const },
  { id: 4, name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", status: "inactive" as const },
  { id: 5, name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", status: "active" as const },
  { id: 6, name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", status: "active" as const },
  { id: 7, name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", status: "pending" as const },
  { id: 8, name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", status: "active" as const },
];

const statusVariant = {
  active: "success",
  inactive: "error",
  pending: "warning",
} as const;

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Users</h1>
          <p className="text-xs text-tertiary mt-0.5">{users.length} team members</p>
        </div>
        <Button variant="primary" size="sm">Invite User</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-lg border pl-8 pr-3 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30"
        />
      </div>

      {/* Table */}
      <Card.Root className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Role</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-tertiary px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-surface-border-subtle last:border-0 hover:bg-surface-hover/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="hover:underline">
                    <p className="font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-tertiary">{user.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{user.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/users/${user.id}/edit`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-secondary hover:bg-surface-hover hover:text-primary transition-all"
                  >
                    <PencilSimple size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/users/page.tsx
git commit -m "feat(demo): restyle users page with search, table, and status badges"
```

---

## Task 9: User detail page

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/users/[id]/page.tsx`

- [ ] **Step 1: Rewrite user detail page**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/users/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

const usersData: Record<string, { name: string; email: string; role: string; bio: string; joined: string; status: string }> = {
  "1": { name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", bio: "Alice leads the engineering team with 8 years of experience in full-stack development.", joined: "Jan 2022", status: "active" },
  "2": { name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", bio: "Bob crafts intuitive user experiences with a background in visual design and research.", joined: "Mar 2022", status: "active" },
  "3": { name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", bio: "Carol builds scalable APIs and services, specializing in distributed systems.", joined: "Jun 2022", status: "active" },
  "4": { name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", bio: "David creates responsive and performant web interfaces using React and Next.js.", joined: "Sep 2022", status: "inactive" },
  "5": { name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", bio: "Eve ensures product quality through comprehensive testing and automation.", joined: "Nov 2022", status: "active" },
  "6": { name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", bio: "Frank manages CI/CD pipelines and cloud infrastructure.", joined: "Jan 2023", status: "active" },
  "7": { name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", bio: "Grace drives product strategy and roadmap planning.", joined: "Feb 2023", status: "pending" },
  "8": { name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", bio: "Henry transforms raw data into actionable business insights.", joined: "Apr 2023", status: "active" },
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = usersData[id];

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-primary">User Not Found</h1>
        <p className="text-sm text-tertiary">No user found with ID {id}.</p>
        <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>
      </div>
    );
  }

  const statusVariant = user.status === "active" ? "success" : user.status === "pending" ? "warning" : "error";

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>

      <Card.Root>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-overlay flex items-center justify-center text-base font-semibold text-secondary">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <Card.Title className="text-base">{user.name}</Card.Title>
                <p className="text-xs text-brand font-medium">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant as "success" | "warning" | "error"}>{user.status}</Badge>
              <Link href={`/users/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Email</p>
              <p className="text-sm text-primary">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Joined</p>
              <p className="text-sm text-primary">{user.joined}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Bio</p>
              <p className="text-sm text-secondary leading-relaxed">{user.bio}</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/users/'[id]'/page.tsx
git commit -m "feat(demo): restyle user detail page with Card, Badge, and avatar"
```

---

## Task 10: User edit page (new route)

**Files:**
- Create: `demos/test/demo-nextjs-app/src/app/(dashboard)/users/[id]/edit/page.tsx`

- [ ] **Step 1: Create the user edit page**

Create `demos/test/demo-nextjs-app/src/app/(dashboard)/users/[id]/edit/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const usersData: Record<string, { name: string; email: string; role: string; bio: string }> = {
  "1": { name: "Alice Johnson", email: "alice@acme.com", role: "Engineering Lead", bio: "Alice leads the engineering team with 8 years of experience." },
  "2": { name: "Bob Smith", email: "bob@acme.com", role: "Product Designer", bio: "Bob crafts intuitive user experiences." },
  "3": { name: "Carol Williams", email: "carol@acme.com", role: "Backend Engineer", bio: "Carol builds scalable APIs and services." },
  "4": { name: "David Brown", email: "david@acme.com", role: "Frontend Engineer", bio: "David creates responsive web interfaces." },
  "5": { name: "Eve Davis", email: "eve@acme.com", role: "QA Engineer", bio: "Eve ensures product quality through testing." },
  "6": { name: "Frank Garcia", email: "frank@acme.com", role: "DevOps Engineer", bio: "Frank manages CI/CD pipelines." },
  "7": { name: "Grace Lee", email: "grace@acme.com", role: "Product Manager", bio: "Grace drives product strategy." },
  "8": { name: "Henry Wilson", email: "henry@acme.com", role: "Data Analyst", bio: "Henry transforms data into insights." },
};

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const user = usersData[id];

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-primary">User Not Found</h1>
        <Link href="/users" className="text-sm font-medium text-brand hover:underline">&larr; Back to Users</Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Saving user:", { id, name, email, role, bio });
    router.push(`/users/${id}`);
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Link href={`/users/${id}`} className="text-sm font-medium text-brand hover:underline">&larr; Back to {user.name}</Link>

      <Card.Root>
        <Card.Header>
          <Card.Title>Edit User</Card.Title>
          <Card.Description>Update user information</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Role" id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-xs font-medium text-secondary">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/users/'[id]'/edit/page.tsx
git commit -m "feat(demo): add user edit page with form"
```

---

## Task 11: Settings page with Tabs component

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Rewrite settings page**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/settings/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Tabs } from "@/ui/tabs";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const settingsTabs = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-primary">Settings</h1>
        <p className="text-xs text-tertiary mt-0.5">Manage your account preferences</p>
      </div>

      <Tabs tabs={settingsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "general" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>Your personal information</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input label="Display Name" id="name" defaultValue="Derrick Tsorme" />
              <Input label="Email" id="email" type="email" defaultValue="derrick@acme.com" />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tz" className="text-xs font-medium text-secondary">Timezone</label>
                <select
                  id="tz"
                  defaultValue="UTC"
                  className="w-full h-9 rounded-lg border px-3 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">Save Changes</Button>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      )}

      {activeTab === "notifications" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
            <Card.Description>Choose what you want to be notified about</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[
                { label: "Email notifications", desc: "Receive email updates for important events" },
                { label: "Push notifications", desc: "Get push notifications on your device" },
                { label: "Weekly digest", desc: "Receive a weekly summary of activity" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-surface-border-subtle">
                  <div>
                    <p className="text-sm font-medium text-primary">{item.label}</p>
                    <p className="text-xs text-tertiary">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand" />
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      )}

      {activeTab === "security" && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Security</Card.Title>
            <Card.Description>Manage your password and authentication</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input label="Current Password" id="current-pw" type="password" placeholder="Enter current password" />
              <Input label="New Password" id="new-pw" type="password" placeholder="Enter new password" />
              <div className="flex items-center justify-between p-3 rounded-lg border border-surface-border-subtle">
                <div>
                  <p className="text-sm font-medium text-primary">Two-Factor Authentication</p>
                  <p className="text-xs text-tertiary">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">Update Password</Button>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/settings/page.tsx
git commit -m "feat(demo): restyle settings page with Tabs and Card components"
```

---

## Task 12: Notifications page with badges

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/(dashboard)/notifications/page.tsx`

- [ ] **Step 1: Rewrite notifications page**

Rewrite `demos/test/demo-nextjs-app/src/app/(dashboard)/notifications/page.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/utils";

const notifications = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  message: [
    "Alice Johnson commented on your pull request",
    "Bob Smith shared a new design file",
    "Carol Williams deployed the latest build",
    "David Brown requested a code review",
    "Eve Davis reported a test failure",
    "Frank Garcia merged branch feature/auth",
    "Grace Lee created a new project",
    "Henry Wilson assigned you a task",
    "Ivy Chen updated the documentation",
    "Jack Martin closed issue #42",
  ][i % 10],
  userId: (i % 5) + 1,
  time: i < 3 ? `${(i + 1) * 5} min ago` : i < 10 ? `${i} hours ago` : `${i - 9} days ago`,
  read: i >= 4,
  type: (["info", "success", "warning", "error"] as const)[i % 4],
}));

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Notifications</h1>
          <p className="text-xs text-tertiary mt-0.5">{unreadCount} unread</p>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={`/users/${n.userId}`}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              n.read
                ? "border-surface-border-subtle bg-surface-card opacity-60 hover:opacity-80"
                : "border-surface-border bg-surface-raised hover:bg-surface-hover/50",
            )}
          >
            <div className="flex items-center gap-3">
              {!n.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
              <p className={cn("text-sm", n.read ? "text-secondary" : "text-primary font-medium")}>
                {n.message}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Badge variant={n.type}>{n.type}</Badge>
              <span className="text-xs text-tertiary whitespace-nowrap">{n.time}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-tertiary py-4">End of notifications</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/notifications/page.tsx
git commit -m "feat(demo): restyle notifications page with badges and read/unread states"
```

---

## Task 13: Analytics page (new route)

**Files:**
- Create: `demos/test/demo-nextjs-app/src/app/(dashboard)/analytics/page.tsx`

- [ ] **Step 1: Create analytics page**

Create `demos/test/demo-nextjs-app/src/app/(dashboard)/analytics/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Tabs } from "@/ui/tabs";
import { StatCard } from "@/ui/stat-card";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";

const analyticsTabs = [
  { key: "overview", label: "Overview" },
  { key: "traffic", label: "Traffic" },
  { key: "conversions", label: "Conversions" },
];

const topPages = [
  { path: "/", views: "12,847", bounce: "32%", trend: "up" },
  { path: "/pricing", views: "8,392", bounce: "18%", trend: "up" },
  { path: "/login", views: "6,103", bounce: "45%", trend: "down" },
  { path: "/about", views: "3,291", bounce: "22%", trend: "up" },
  { path: "/contact", views: "1,847", bounce: "38%", trend: "down" },
];

const trafficSources = [
  { source: "Direct", visitors: "4,281", pct: 42 },
  { source: "Google Search", visitors: "2,847", pct: 28 },
  { source: "Twitter / X", visitors: "1,293", pct: 13 },
  { source: "GitHub", visitors: "982", pct: 10 },
  { source: "Other", visitors: "712", pct: 7 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-primary">Analytics</h1>
        <p className="text-xs text-tertiary mt-0.5">Last 30 days performance</p>
      </div>

      <Tabs tabs={analyticsTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Page Views" value="32,487" change="+24%" />
        <StatCard label="Unique Visitors" value="10,115" change="+12%" />
        <StatCard label="Avg. Session" value="2m 34s" change="+8%" />
        <StatCard label="Bounce Rate" value="28.4%" change="-3.2%" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Top Pages</Card.Title>
            <Card.Description>Most visited pages this month</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between py-2 border-b border-surface-border-subtle last:border-0">
                  <div>
                    <p className="text-sm font-medium text-primary font-mono">{page.path}</p>
                    <p className="text-xs text-tertiary">{page.views} views</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">{page.bounce} bounce</span>
                    <Badge variant={page.trend === "up" ? "success" : "error"}>
                      {page.trend === "up" ? "+" : "-"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>

        {/* Traffic Sources */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Traffic Sources</Card.Title>
            <Card.Description>Where your visitors come from</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {trafficSources.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{src.source}</p>
                    <p className="text-xs text-tertiary">{src.visitors} ({src.pct}%)</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-overlay overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/analytics/page.tsx
git commit -m "feat(demo): add analytics page with metrics, top pages, and traffic sources"
```

---

## Task 14: Billing page (new route)

**Files:**
- Create: `demos/test/demo-nextjs-app/src/app/(dashboard)/billing/page.tsx`

- [ ] **Step 1: Create billing page**

Create `demos/test/demo-nextjs-app/src/app/(dashboard)/billing/page.tsx`:

```tsx
import Link from "next/link";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

const invoices = [
  { id: "INV-001", date: "Mar 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-002", date: "Feb 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-003", date: "Jan 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-004", date: "Dec 2025", amount: "$12.00", status: "paid" as const },
  { id: "INV-005", date: "Nov 2025", amount: "$12.00", status: "refunded" as const },
];

const invoiceVariant = {
  paid: "success",
  refunded: "warning",
  overdue: "error",
} as const;

export default function BillingPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold text-primary">Billing</h1>
        <p className="text-xs text-tertiary mt-0.5">Manage your subscription and invoices</p>
      </div>

      {/* Current Plan */}
      <Card.Root>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Pro Plan</Card.Title>
              <Card.Description>$29/month &middot; Renews Apr 15, 2026</Card.Description>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Active</Badge>
              <Link href="/pricing">
                <Button variant="outline" size="sm">Change Plan</Button>
              </Link>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Users</p>
              <p className="text-sm text-primary">8 / 25</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">Storage</p>
              <p className="text-sm text-primary">4.2 GB / 50 GB</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mb-0.5">API Calls</p>
              <p className="text-sm text-primary">12,847 / 100,000</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Invoices */}
      <Card.Root className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-primary">Invoice History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left text-xs font-medium text-tertiary px-4 py-2">Invoice</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-2">Date</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-2">Amount</th>
              <th className="text-left text-xs font-medium text-tertiary px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-surface-border-subtle last:border-0 hover:bg-surface-hover/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-primary font-mono text-xs">{inv.id}</td>
                <td className="px-4 py-2.5 text-secondary">{inv.date}</td>
                <td className="px-4 py-2.5 text-primary">{inv.amount}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={invoiceVariant[inv.status]}>{inv.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/'(dashboard)'/billing/page.tsx
git commit -m "feat(demo): add billing page with plan info and invoice table"
```

---

## Task 15: Marketing pages — Home, About, Pricing, Contact, Login, 404

**Files:**
- Rewrite: `demos/test/demo-nextjs-app/src/app/page.tsx`
- Rewrite: `demos/test/demo-nextjs-app/src/app/not-found.tsx`
- Rewrite: `demos/test/demo-nextjs-app/src/app/login/page.tsx`
- Rewrite: `demos/test/demo-nextjs-app/src/app/(marketing)/about/page.tsx`
- Rewrite: `demos/test/demo-nextjs-app/src/app/(marketing)/pricing/page.tsx`
- Create: `demos/test/demo-nextjs-app/src/app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Rewrite Home page**

Rewrite `demos/test/demo-nextjs-app/src/app/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Rewrite 404 page**

Rewrite `demos/test/demo-nextjs-app/src/app/not-found.tsx`:

```tsx
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
```

- [ ] **Step 3: Rewrite Login page**

Rewrite `demos/test/demo-nextjs-app/src/app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login attempt:", { username });
    localStorage.setItem("user", JSON.stringify({ username, loggedIn: true }));
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6">
      <Card.Root className="w-full max-w-sm">
        <Card.Header>
          <Card.Title className="text-lg">Welcome back</Card.Title>
          <Card.Description>Sign in to your account</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button variant="primary" className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite About page**

Rewrite `demos/test/demo-nextjs-app/src/app/(marketing)/about/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Rewrite Pricing page**

Rewrite `demos/test/demo-nextjs-app/src/app/(marketing)/pricing/page.tsx`:

```tsx
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
```

- [ ] **Step 6: Create Contact page**

Create `demos/test/demo-nextjs-app/src/app/(marketing)/contact/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form submitted:", { name, email, message });
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6">
      <Card.Root className="w-full max-w-md">
        <Card.Header>
          <Card.Title className="text-lg">Get in Touch</Card.Title>
          <Card.Description>We&apos;d love to hear from you</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            <Input label="Email" id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-msg" className="text-xs font-medium text-secondary">Message</label>
              <textarea
                id="contact-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="How can we help?"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30 resize-none"
              />
            </div>
            <Button variant="primary" className="w-full" type="submit">
              Send Message
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add demos/test/demo-nextjs-app/src/app/page.tsx demos/test/demo-nextjs-app/src/app/not-found.tsx demos/test/demo-nextjs-app/src/app/login/page.tsx demos/test/demo-nextjs-app/src/app/'(marketing)'/about/page.tsx demos/test/demo-nextjs-app/src/app/'(marketing)'/pricing/page.tsx demos/test/demo-nextjs-app/src/app/'(marketing)'/contact/page.tsx
git commit -m "feat(demo): restyle all marketing pages and add contact page"
```

---

## Task 16: Verify full app and fix any issues

**Files:** All modified files

- [ ] **Step 1: Run the dev server and verify all routes**

```bash
cd demos/test/demo-nextjs-app && npm run dev
```

Open each route in the browser and verify it renders correctly:
- http://localhost:3001 — Landing page
- http://localhost:3001/about — About page
- http://localhost:3001/pricing — Pricing tiers
- http://localhost:3001/contact — Contact form
- http://localhost:3001/login — Login form
- http://localhost:3001/analytics — Analytics dashboard
- http://localhost:3001/users — Users table with search
- http://localhost:3001/users/1 — User detail
- http://localhost:3001/users/1/edit — User edit form
- http://localhost:3001/billing — Billing + invoices
- http://localhost:3001/notifications — Notifications list
- http://localhost:3001/settings — Settings with tabs

- [ ] **Step 2: Fix any TypeScript or rendering issues**

Run: `cd demos/test/demo-nextjs-app && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Test with Mappd**

```bash
cd cli && npx tsx src/index.ts dev -d ../demos/test/demo-nextjs-app
```

Expected: Mappd detects 13+ routes with connections, canvas renders all pages with styled previews

- [ ] **Step 4: Final commit**

```bash
git add -A demos/test/demo-nextjs-app/
git commit -m "feat(demo): complete dashboard upgrade — 13 routes, Tailwind design system, production-quality UI"
```
