import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "../auth/utils";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className, checked, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink-600",
          className,
        )}
      >
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition-colors checked:border-hc-primary checked:bg-hc-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-primary/40 focus-visible:ring-offset-1"
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3}
            aria-hidden
            className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        {label}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
