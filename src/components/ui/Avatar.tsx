import { cn } from "../auth/utils";

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

/** Circular initials avatar with the brand gradient fill. */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hc-primary to-hc-secondary font-semibold text-white shadow-sm shadow-hc-primary/25",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initialsOf(name) || "?"}
    </span>
  );
}
