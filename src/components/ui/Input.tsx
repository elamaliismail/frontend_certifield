import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../auth/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Icon rendered on the leading edge of the field. */
  icon?: ReactNode;
  /** Optional control rendered on the trailing edge (e.g. show-password). */
  trailing?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, trailing, error, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink-900"
        >
          {label}
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors focus-within:border-hc-primary focus-within:ring-2 focus-within:ring-hc-primary/20",
            error ? "border-status-red-fg/60" : "border-slate-200",
          )}
        >
          {icon && (
            <span className="shrink-0 text-ink-400" aria-hidden>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400",
              className,
            )}
            {...props}
          />
          {trailing && <span className="shrink-0">{trailing}</span>}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-status-red-fg">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
