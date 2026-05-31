import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground border-transparent",
        secondary:   "bg-secondary text-secondary-foreground border-transparent",
        outline:     "border-input bg-background text-foreground",
        primary:     "bg-primary text-primary-foreground border-transparent",
        // Semantic status variants
        success:     "bg-[#0CE4AC]/12 text-[#0aad84] border-transparent",
        approved:    "bg-[#0CE4AC]/12 text-[#0aad84] border-transparent",
        warning:     "bg-[#F59E0B]/12 text-[#b45309] border-transparent",
        pending:     "bg-[#F59E0B]/12 text-[#b45309] border-transparent",
        inReview:    "bg-[#3B82F6]/12 text-[#2563eb] border-transparent",
        destructive: "bg-[#EF4444]/12 text-[#dc2626] border-transparent",
        rejected:    "bg-[#EF4444]/12 text-[#dc2626] border-transparent",
        draft:       "bg-[#6B7E8E]/12 text-[#6B7E8E] border-transparent",
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
