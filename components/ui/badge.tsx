import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "error" | "warning" | "neutral" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        success: "bg-success/10 text-success border-success/20",
        error: "bg-error/10 text-error border-error/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        neutral: "bg-gray-100 text-gray-700 border-gray-200",
        outline: "text-foreground border-border bg-transparent",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
