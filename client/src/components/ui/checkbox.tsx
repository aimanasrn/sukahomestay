import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} type="checkbox" className={cn("size-4 rounded border-input accent-[var(--primary)]", className)} {...props} />,
);
Checkbox.displayName = "Checkbox";
