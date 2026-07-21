interface DividerProps {
  /** Text centered within the divider, e.g. "OR". */
  label?: string;
}

export function Divider({ label }: DividerProps) {
  if (!label) {
    return <hr className="border-slate-200" />;
  }

  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
