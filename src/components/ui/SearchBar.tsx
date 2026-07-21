import { Search } from "lucide-react";
import { cn } from "../auth/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Standard search field: leading magnifier icon and the login's focus ring.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className,
  "aria-label": ariaLabel,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-hc-primary focus:ring-2 focus:ring-hc-primary/20"
      />
    </div>
  );
}
