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
