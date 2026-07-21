import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "../auth/utils";

type BannerTone = "amber" | "green" | "red" | "blue";

const TONE_CLASSES: Record<BannerTone, string> = {
  amber: "border-status-amber-fg/30 bg-status-amber-bg text-status-amber-fg",
  green: "border-status-green-fg/30 bg-status-green-bg text-status-green-fg",
  red: "border-status-red-fg/30 bg-status-red-bg text-status-red-fg",
  blue: "border-status-blue-fg/30 bg-status-blue-bg text-status-blue-fg",
};

interface BannerProps {
  children: ReactNode;
  tone?: BannerTone;
  icon?: ReactNode;
  className?: string;
}

/** Inline contextual banner (demo-data notices, signed-lock notice, etc.). */
export function Banner({
  children,
  tone = "amber",
  icon,
  className,
}: BannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{icon ?? <Info size={16} />}</span>
      <span>{children}</span>
    </div>
  );
}
