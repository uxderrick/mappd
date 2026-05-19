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
