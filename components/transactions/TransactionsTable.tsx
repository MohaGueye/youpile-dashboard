"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, CheckCircle, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function TransactionsTable({ data }: { data: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = React.useState<string | null>(null)

    const handleAction = async (id: string, endpoint: string, successMsg: string) => {
        if (!confirm("Confirmer cette action irréversible sur la transaction ?")) return;
        setLoadingId(id)
        try {
            const res = await fetch(`/api/admin/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_id: id, reason: "Intervention Admin" })
            })
            const result = await res.json()
            if (res.ok) {
                toast.success(successMsg)
                router.refresh()
            } else {
                toast.error(result.error || "Erreur serveur")
            }
        } catch {
            toast.error("Erreur réseau")
        } finally {
            setLoadingId(null)
        }
    }
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Réf",
            cell: ({ row }) => <span className="font-mono text-xs uppercase" title={row.original.id}>{row.original.id.substring(0, 8)}</span>
        },
        {
            accessorKey: "buyer",
            header: "Acheteur",
            cell: ({ row }) => <span>{row.original.buyer?.username || row.original.buyer_id}</span>
        },
        {
            accessorKey: "seller",
            header: "Vendeur",
            cell: ({ row }) => <span>{row.original.seller?.username || row.original.seller_id}</span>
        },
        {
            accessorKey: "amount",
            header: "Montant",
            cell: ({ row }) => <span className="font-bold">{row.original.amount} XOF</span>
        },
        {
            accessorKey: "fees",
            header: "Frais",
            cell: ({ row }) => <span className="text-text-muted">{row.original.fees} XOF</span>
        },
        {
            accessorKey: "net_amount",
            header: "Net Vendeur",
            cell: ({ row }) => <span className="text-success font-medium">{row.original.net_amount} XOF</span>
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge type="transaction" status={row.original.status} />
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.created_at), 'dd/MM/yyyy HH:mm')}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const t = row.original
                return (
                    <div className="relative group inline-block text-left" tabIndex={0}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-focus-within:block w-48 bg-white border border-border shadow-lg rounded-md py-1">
                            <Link href={`/transactions/${t.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                <FileText className="h-4 w-4" /> Voir détail
                            </Link>
                            {t.status === 'escrow' && (
                                <button
                                    onClick={() => handleAction(t.id, 'release-escrow', 'Transaction forcée et créancier payé')}
                                    disabled={loadingId === t.id}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-success hover:bg-green-50 w-full text-left"
                                >
                                    <CheckCircle className="h-4 w-4" /> {loadingId === t.id ? "En cours..." : "Forcer libération"}
                                </button>
                            )}
                            {['escrow', 'paid', 'pending'].includes(t.status) && (
                                <button
                                    onClick={() => handleAction(t.id, 'refund', 'Acheteur remboursé')}
                                    disabled={loadingId === t.id}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left"
                                >
                                    <RotateCcw className="h-4 w-4" /> {loadingId === t.id ? "En cours..." : "Rembourser"}
                                </button>
                            )}
                        </div>
                    </div>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="id" />
}
