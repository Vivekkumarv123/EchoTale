import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#3D2C2E] text-white",
        natural:
          "bg-[#7C5C5E] text-white",
        secondary:
          "bg-[#7C5C5E15] text-[#7C5C5E]",
        outline:
          "border border-[#7C5C5E30] text-[#7C5C5E] bg-white/40",
        verified:
          "bg-[#4C7C5E20] text-[#4C7C5E] border border-[#4C7C5E30]",
        warm:
          "bg-[#7C5C5E15] text-[#7C5C5E] border border-[#7C5C5E25]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
