import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary shadow-sm",
        secondary:
          "bg-secondary text-white hover:bg-secondary-hover focus-visible:ring-secondary shadow-sm",
        destructive:
          "bg-red text-white hover:bg-red/90 focus-visible:ring-red shadow-sm",
        outline:
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus-visible:ring-secondary",
        ghost:
          "text-text-main hover:bg-text-main/5 focus-visible:ring-text-main",
        link:
          "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        accent:
          "bg-accent text-text-main hover:bg-accent-hover focus-visible:ring-accent shadow-sm",
        orange:
          "bg-orange text-white hover:bg-orange/90 focus-visible:ring-orange shadow-sm",
      },
      size: {
        lg: "h-12 px-8 text-base rounded-full",
        default: "h-10 px-6 text-sm rounded-full",
        sm: "h-9 px-4 text-sm rounded-full",
        tiny: "h-7 px-3 text-xs rounded-full",
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
