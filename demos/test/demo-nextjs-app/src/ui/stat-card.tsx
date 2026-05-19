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
