"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function PayoutsTable({ data }: { data: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = React.useState<string | null>(null)

    const handleApprove = async (id: string, userId: string, amount: number) => {
        if (!confirm(`Voulez-vous vérifier et initier le transfert Bictorys de ${amount} XOF pour cet utilisateur ?`)) return;
        setLoadingId(id)
        try {
            const res = await fetch('/api/admin/approve-payout', {
                method: 'POST',
                body: JSON.stringify({ payout_id: id, user_id: userId, amount })
            })
            if (res.ok) {
                toast.success("Virement approuvé et initié")
                router.refresh()
            } else {
                const d = await res.json()
                toast.error(d.error || "Erreur lors de l'approbation")
            }
        } catch {
            toast.error("Erreur serveur API")
        } finally {
            setLoadingId(null)
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "user",
            header: "Vendeur",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.profiles?.username}</span>
                    <span className="text-xs text-text-muted">{row.original.profiles?.phone || 'Pas de numéro'}</span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Montant à virer",
            cell: ({ row }) => <span className="font-bold text-lg">{row.original.amount} XOF</span>
        },
        {
            accessorKey: "description",
            header: "Détails",
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.description}</span>
        },
        {
            accessorKey: "created_at",
            header: "Date demande",
            cell: ({ row }) => <span className="text-sm text-text-muted">{format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const isPending = row.original.status === 'pending'
                if (!isPending) {
                    return (
                        <div className="flex items-center gap-1.5 text-success font-medium text-sm">
                            <CheckCircle2 className="h-4 w-4" /> Effectué
                        </div>
                    )
                }
                return (
                    <Button
                        size="sm"
                        onClick={() => handleApprove(row.original.id, row.original.user_id, row.original.amount)}
                        disabled={loadingId === row.original.id}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {loadingId === row.original.id ? "Traitement..." : "Approuver et Essayer"}
                    </Button>
                )
            },
        }
    ]

    return (
        <div className="border border-border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-surface px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Demandes de virements en attente</h3>
            </div>
            <DataTable columns={columns} data={data} searchKey="description" />
        </div>
    )
}
