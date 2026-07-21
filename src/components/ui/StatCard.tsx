import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { cn } from "../auth/utils";
import { fadeUp } from "./motion";

type StatTone = "blue" | "green" | "amber" | "teal" | "red";

const TONE_CLASSES: Record<StatTone, string> = {
  blue: "from-hc-primary to-hc-secondary shadow-hc-primary/30",
  green: "from-emerald-500 to-teal-500 shadow-emerald-500/30",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/30",
  teal: "from-teal-500 to-cyan-500 shadow-teal-500/30",
  red: "from-rose-500 to-red-500 shadow-rose-500/30",
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone?: StatTone;
  loading?: boolean;
}

/**
 * KPI tile for the dashboard: a soft card with a gradient icon badge that
 * echoes the login's primary gradient. Lifts gently on hover.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  loading = false,
}: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-hc-primary/10"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-105",
            TONE_CLASSES[tone],
          )}
        >
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-ink-900">
        {loading ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-slate-200" />
        ) : (
          value
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </motion.div>
  );
}
