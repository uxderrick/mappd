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
