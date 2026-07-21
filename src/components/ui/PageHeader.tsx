import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../auth/utils";
import { fadeUp } from "./motion";

interface PageHeaderProps {
  /** Optional page title (the Topbar already shows the route title). */
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Intro row for a page: a description on the left and primary actions on the
 * right, animated in with the shared fade-up variant.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">
            {title}
          </h2>
        )}
        {description && (
          <p className="max-w-3xl text-sm text-ink-600">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
