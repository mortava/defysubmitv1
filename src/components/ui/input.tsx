import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-white/20 bg-black/50 px-4 py-2 text-sm text-white placeholder:text-white/40 transition-all duration-200",
          "focus:outline-none focus:border-[rgb(0,245,255)] focus:ring-1 focus:ring-[rgb(0,245,255)] focus:shadow-[0_0_10px_rgba(0,245,255,0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
