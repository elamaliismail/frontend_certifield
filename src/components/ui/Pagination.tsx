import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../auth/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total item count, shown as a summary when provided. */
  total?: number;
  pageSize?: number;
  className?: string;
}

/**
 * Compact page navigation with a results summary. Renders nothing when there
 * is a single page of results.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const summary =
    total !== undefined && pageSize !== undefined
      ? `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(
          page * pageSize,
          total,
        )} sur ${total}`
      : `Page ${page} / ${pageCount}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5",
        className,
      )}
    >
      <span className="text-xs text-ink-400">{summary}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Page précédente"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-ink-600 transition-colors hover:bg-hc-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors",
              p === page
                ? "bg-gradient-to-r from-hc-primary to-hc-secondary text-white shadow-sm shadow-hc-primary/30"
                : "border border-slate-200 text-ink-600 hover:bg-hc-bg",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Page suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-ink-600 transition-colors hover:bg-hc-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
