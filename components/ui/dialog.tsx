import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div className="z-50 max-w-lg w-full rounded-xl bg-white p-6 shadow-lg border border-border animate-in fade-in zoom-in-95 overflow-hidden">
                {children}
            </div>
        </div>
    )
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("space-y-4", className)}>{children}</div>
)

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
            {...props}
        />
    )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-text-muted", className)}
            {...props}
        />
    )
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2", className)}>
        {children}
    </div>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
