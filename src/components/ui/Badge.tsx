import type { ReactNode } from "react";
import { cn } from "../auth/utils";

export type BadgeTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "teal"
  | "slate";

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: "bg-status-blue-bg text-status-blue-fg",
  green: "bg-status-green-bg text-status-green-fg",
  amber: "bg-status-amber-bg text-status-amber-fg",
  red: "bg-status-red-bg text-status-red-fg",
  teal: "bg-teal-50 text-teal-700",
  slate: "bg-slate-100 text-ink-600",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Renders a small leading status dot. */
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * Pill-shaped status badge used for statuses, roles and audit actions.
 * The tone map keeps colours consistent with the login status styles.
 */
export function Badge({
  children,
  tone = "slate",
  dot = false,
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {icon}
      {children}
    </span>
  );
}
