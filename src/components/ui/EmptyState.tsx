import type { ComponentType, ReactNode } from "react";
import { cn } from "../auth/utils";

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Friendly empty placeholder with a gradient-tinted icon medallion, used when
 * lists / tables have no rows.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hc-primary/10 to-hc-secondary/10 text-hc-primary ring-1 ring-hc-primary/10">
        <Icon size={24} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
