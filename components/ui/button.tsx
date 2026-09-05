import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5C5E]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#3D2C2E] text-white hover:bg-[#2A1E20] active:scale-[0.99] shadow-lg shadow-[#3D2C2E20]",
        natural:
          "bg-[#7C5C5E] text-white hover:bg-[#684b4d] active:scale-[0.99] shadow-md shadow-[#7C5C5E25]",
        secondary:
          "bg-white/60 text-[#3D2C2E] hover:bg-white/90 border border-white/80 active:scale-[0.99]",
        outline:
          "border border-[#7C5C5E30] bg-transparent text-[#7C5C5E] hover:bg-white/80 hover:text-[#3D2C2E] rounded-full",
        ghost:
          "text-[#7C5C5E] hover:bg-[#7C5C5E10] hover:text-[#3D2C2E]",
        link:
          "text-[#7C5C5E] underline-offset-4 hover:underline",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 shadow-sm",
        verified:
          "bg-[#4C7C5E20] text-[#4C7C5E] border border-[#4C7C5E30]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
