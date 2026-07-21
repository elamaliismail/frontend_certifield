import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../auth/utils";
import { fadeUp } from "./motion";
import { SkeletonRows } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  skeletonRows?: number;
  /** Content rendered (centered, full width) when there are no rows. */
  empty?: ReactNode;
  /** Optional footer area under the table body (e.g. pagination). */
  footer?: ReactNode;
  className?: string;
}

const ALIGN: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Generic, config-driven table sharing one consistent shell: rounded card,
 * subtle header, hover rows, skeleton loading and empty states.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  empty,
  footer,
  className,
}: DataTableProps<T>) {
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-hc-bg text-xs font-semibold uppercase tracking-wide text-ink-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3",
                    col.align && ALIGN[col.align],
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 && (
              <SkeletonRows rows={skeletonRows} columns={columns.length} />
            )}

            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-slate-100 transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-hc-bg",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 align-middle text-ink-600",
                      col.align && ALIGN[col.align],
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}

            {showEmpty && (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </motion.div>
  );
}
