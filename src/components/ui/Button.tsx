import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../auth/utils";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Renders an animated sheen sweeping across the button (primary only). */
  shine?: boolean;
  /** Stretch to fill the container width (default true, as on the login form). */
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-hc-primary to-hc-secondary text-white shadow-lg shadow-hc-primary/30 hover:shadow-xl hover:shadow-hc-primary/40 focus-visible:ring-hc-primary",
  outline:
    "border border-slate-200 bg-white text-ink-900 hover:bg-hc-bg hover:border-slate-300 focus-visible:ring-hc-secondary",
  ghost:
    "text-hc-primary hover:bg-hc-primary/5 focus-visible:ring-hc-primary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      shine = false,
      fullWidth = true,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "w-auto",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {shine && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 blur-md motion-safe:animate-shine"
        />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  ),
);

Button.displayName = "Button";
