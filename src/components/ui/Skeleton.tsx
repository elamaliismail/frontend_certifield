import { cn } from "../auth/utils";

interface SkeletonProps {
  className?: string;
}

/** A single shimmering placeholder block. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,#eef2f7_25%,#e2e8f0_37%,#eef2f7_63%)] bg-[length:400%_100%] motion-safe:animate-shimmer",
        className,
      )}
    />
  );
}

/** A vertical stack of shimmering text lines. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3.5", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Skeleton rows sized to sit inside a table body while data loads. */
export function SkeletonRows({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-5 py-4">
              <Skeleton
                className={cn("h-3.5", colIndex === 0 ? "w-40" : "w-24")}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
