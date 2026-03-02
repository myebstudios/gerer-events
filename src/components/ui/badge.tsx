import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary",
                secondary: "bg-secondary/10 text-secondary",
                success: "bg-primary-light text-primary",
                warning: "bg-accent-light text-amber-700",
                danger: "bg-red-light text-red",
                info: "bg-secondary-light text-secondary",
                orange: "bg-orange-light text-orange",
                emerald: "bg-emerald-light text-emerald",
                pink: "bg-pink-light text-pink",
                purple: "bg-purple-light text-purple",
                outline: "border border-border text-text-muted bg-transparent",
                ghost: "bg-text-main/5 text-text-main",
            },
            size: {
                default: "px-3 py-1 text-xs rounded-full",
                sm: "px-2 py-0.5 text-[10px] rounded-full",
                lg: "px-4 py-1.5 text-sm rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(badgeVariants({ variant, size, className }))}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
