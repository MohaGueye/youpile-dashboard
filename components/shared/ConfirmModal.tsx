"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "destructive"
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => Promise<void>
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "default" | "warning" // Rebuild simple buttons if needed
}) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
            onOpenChange(false)
        } finally {
            if (!open) return
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === "destructive" ? "destructive" : "default"}
                    onClick={handleConfirm}
                    disabled={loading}
                    className={variant === "warning" ? "bg-warning hover:bg-warning/90 text-white" : ""}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {confirmText}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
