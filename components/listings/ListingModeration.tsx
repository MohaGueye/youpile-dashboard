"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ListingModerationProps {
    listingId: string
    title: string
    currentStatus: string
}

export function ListingModeration({ listingId, title, currentStatus }: ListingModerationProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState("")
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        if (!reason.trim()) {
            toast.error("Veuillez indiquer un motif de suppression")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/delete-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: listingId, reason })
            })

            if (res.ok) {
                toast.success("Annonce supprimée et vendeur notifié")
                setOpen(false)
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.error || "Une erreur est survenue")
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur")
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === 'deleted') {
        return (
            <div className="bg-error/5 p-4 rounded-lg border border-error/20 flex items-center gap-3 text-error">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Cette annonce a déjà été supprimée par la modération.</span>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Modération de l'annonce</h3>

            <Button
                variant="outline"
                className="w-full justify-start text-error border-error/20 bg-error/5"
                onClick={() => setOpen(true)}
            >
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer l'annonce
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeader>
                    <DialogTitle>Supprimer l'annonce ?</DialogTitle>
                    <DialogDescription>
                        Vous êtes sur le point de supprimer l'annonce <strong>"{title}"</strong>.
                        Le vendeur recevra une notification push expliquant le motif.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Motif de suppression</Label>
                        <Input
                            id="reason"
                            placeholder="Ex: Article interdit, Contrefaçon, Fraude..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        Confirmer la suppression
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
