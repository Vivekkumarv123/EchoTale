import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-[#e2d8cc] bg-[#fbf9f5] px-3.5 py-2 text-sm text-[#221c19] placeholder:text-[#9e9287] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9e5241]/40 focus-visible:border-[#9e5241] transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
