import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../auth/utils";

type IconButtonTone = "neutral" | "danger";

const TONE_CLASSES: Record<IconButtonTone, string> = {
  neutral: "text-ink-400 hover:bg-hc-bg hover:text-ink-900",
  danger: "text-ink-400 hover:bg-status-red-bg hover:text-status-red-fg",
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone;
}

/** Square, subtly-rounded icon action button used inside table rows. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ tone = "neutral", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-400",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = "IconButton";
