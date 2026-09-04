import * as React from "react";
import { cn } from "@/lib/utils";

export const Alert = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="alert" className={cn("rounded-xl border bg-secondary p-4 text-sm leading-6", className)} {...props} />
);
