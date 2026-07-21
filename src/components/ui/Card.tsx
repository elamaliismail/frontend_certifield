import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../auth/utils";
import { fadeUp } from "./motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a lift + ring highlight on hover (use for clickable cards). */
  interactive?: boolean;
  /** Animate the card in with the shared fade-up variant. */
  animate?: boolean;
  onClick?: () => void;
}

/**
 * The base surface used across the app: a white, softly-shadowed rounded card
 * matching the login's card treatment. Optionally lifts on hover and animates
 * in with the shared motion variant.
 */
export function Card({
  children,
  className,
  interactive = false,
  animate = false,
  onClick,
}: CardProps) {
  const classes = cn(
    "rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60",
    interactive &&
      "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-hc-primary/30 hover:shadow-lg hover:shadow-hc-primary/10",
    className,
  );

  if (animate) {
    return (
      <motion.div variants={fadeUp} className={classes} onClick={onClick}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  animate?: boolean;
}

/**
 * A card with a standard header (icon + title + description + trailing action).
 * Encapsulates the repeated "titled panel" pattern used on nearly every page.
 */
export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
  animate = false,
}: SectionCardProps) {
  return (
    <Card animate={animate} className={cn("p-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-hc-primary to-hc-secondary text-white shadow-sm shadow-hc-primary/30">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold text-ink-900">{title}</h3>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-ink-600">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(title || action ? "mt-5" : "", bodyClassName)}>
        {children}
      </div>
    </Card>
  );
}
