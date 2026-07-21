import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, onDismiss, durationMs = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed right-6 top-6 z-[60] flex items-center gap-3 rounded-xl border border-status-green-fg/20 bg-white px-4 py-3 shadow-lg shadow-slate-200/80"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-green-bg text-status-green-fg">
        <CheckCircle2 size={18} />
      </span>
      <span className="text-sm font-medium text-ink-900">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Fermer"
        className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-slate-100 hover:text-ink-900"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
