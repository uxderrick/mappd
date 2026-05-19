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
