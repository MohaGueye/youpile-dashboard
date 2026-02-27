"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export function DisputeDetail({ dispute, transaction }: { dispute: any, transaction: any }) {
    const router = useRouter()
    const [note, setNote] = useState("")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [actionType, setActionType] = useState<'buyer' | 'seller' | null>(null)

    const handleResolve = async () => {
        if (!actionType) return
        const res = await fetch('/api/admin/resolve-dispute', {
            method: 'POST',
            body: JSON.stringify({ dispute_id: dispute.id, action: actionType, note })
        })

        if (res.ok) {
            toast.success("Litige résolu avec succès")
            router.refresh()
        } else {
            const data = await res.json()
            toast.error(data.error || "Une erreur est survenue")
        }
    }

    const openConfirm = (type: 'buyer' | 'seller') => {
        setActionType(type)
        setConfirmOpen(true)
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/disputes')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-mono">Litige #{dispute.id.substring(0, 8)}</h1>
                    <div className="text-sm text-text-muted flex gap-2 items-center mt-1">
                        Lié à la transaction <a href={`/transactions/${transaction.id}`} className="text-primary-dark underline">#{transaction.id.substring(0, 8)}</a>
                    </div>
                </div>
                <StatusBadge type="dispute" status={dispute.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Motif du litige</h3>
                    <div className="font-medium text-error mb-2">{dispute.reason}</div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap bg-surface p-4 rounded-md">
                        {dispute.description}
                    </p>

                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="font-medium text-sm mb-3">Montant en jeu</h4>
                        <div className="flex items-center gap-4 text-center">
                            <div className="flex-1 bg-surface p-3 rounded-md">
                                <div className="text-xs text-text-muted mb-1">Total (Acheteur)</div>
                                <div className="font-bold">{transaction.amount} XOF</div>
                            </div>
                            <div className="flex-1 bg-surface p-3 rounded-md">
                                <div className="text-xs text-text-muted mb-1">Net (Vendeur)</div>
                                <div className="font-bold text-success">{transaction.net_amount} XOF</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Médiation</h3>
                        <div className="text-sm text-text-muted mb-4">
                            La messagerie directe Admin-Utilisateur se fait via l'application mobile en utilisant le chat interne.
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-200 bg-blue-50">
                                Envoyer un message à l'acheteur
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-orange-600 border-orange-200 bg-orange-50">
                                Envoyer un message au vendeur
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {['open', 'in_review'].includes(dispute.status) && (
                <div className="bg-white p-6 rounded-xl border border-error shadow-sm mt-8">
                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4 flex items-center gap-2 text-error">
                        Action de Résolution Définitive
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Note de résolution (Réservé à l'équipe interne)</label>
                            <textarea
                                className="w-full rounded-md border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                rows={3}
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Expliquez brièvement la décision prise..."
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                className="flex-1 bg-error hover:bg-error/90 text-white gap-2"
                                onClick={() => openConfirm('buyer')}
                                disabled={!note.trim()}
                            >
                                <RotateCcw className="h-5 w-5" /> Rembourser l'acheteur ({transaction.amount} XOF)
                            </Button>
                            <Button
                                className="flex-1 bg-success hover:bg-success/90 text-white gap-2"
                                onClick={() => openConfirm('seller')}
                                disabled={!note.trim()}
                            >
                                <CheckCircle className="h-5 w-5" /> Payer le vendeur ({transaction.net_amount} XOF)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {dispute.resolution_note && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Note de résolution interne</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{dispute.resolution_note}</div>
                </div>
            )}

            <ConfirmModal
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirmation de la décision"
                description={`Êtes-vous sûr de vouloir de ${actionType === 'buyer' ? "rembourser entièrement l'acheteur" : "libérer l'argent au vendeur"} ? CETTE ACTION EST IRRÉVERSIBLE.`}
                confirmText="Confirmer la décision finale"
                onConfirm={handleResolve}
            />
        </div>
    )
}
