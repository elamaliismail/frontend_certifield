import type { ComponentType } from "react";
import { cn } from "../auth/utils";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * Underlined tab bar with an animated active indicator in the brand gradient.
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-slate-200",
        className,
      )}
      role="tablist"
    >
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive ? "text-hc-primary" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {Icon && <Icon size={16} />}
            {label}
            {count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-hc-primary/10 text-hc-primary"
                    : "bg-slate-100 text-ink-400",
                )}
              >
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-hc-primary to-hc-secondary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
