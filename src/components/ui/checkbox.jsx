import * as React from "react"
import { cn } from "@/lib/utils"

// Fixed: supports both native onChange AND Radix-style onCheckedChange
const Checkbox = React.forwardRef(({ className, onCheckedChange, onChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-blue-600 cursor-pointer",
      className
    )}
    onChange={(e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    }}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
