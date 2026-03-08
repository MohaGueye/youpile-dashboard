"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Shield, EyeOff, MoreHorizontal, CheckCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function ReportsTable({ data }: { data: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = React.useState<string | null>(null)

    const handleDismiss = async (id: string) => {
        setLoadingId(id)
        try {
            const res = await fetch('/api/admin/dismiss-report', {
                method: 'POST', body: JSON.stringify({ report_id: id })
            })
            if (res.ok) { toast.success("Signalement ignoré"); router.refresh() }
        } catch { toast.error("Erreur") } finally { setLoadingId(null) }
    }

    const handleBan = async (reportId: string, userId: string) => {
        if (!confirm("Bannir cet utilisateur et ignorer le signalement ?")) return;
        setLoadingId(reportId)
        try {
            const res = await fetch('/api/admin/ban-user', {
                method: 'POST', body: JSON.stringify({ user_id: userId, ban: true })
            })
            if (res.ok) {
                await fetch('/api/admin/dismiss-report', { method: 'POST', body: JSON.stringify({ report_id: reportId }) })
                toast.success("Utilisateur banni"); router.refresh()
            }
        } catch { toast.error("Erreur") } finally { setLoadingId(null) }
    }

    const handleDelete = async (reportId: string, listingId: string) => {
        if (!confirm("Supprimer l'annonce/le message lié ?")) return;
        setLoadingId(reportId)
        try {
            const res = await fetch('/api/admin/delete-listing', {
                method: 'POST', body: JSON.stringify({ listing_id: listingId, reason: "Signalement validé par modérateur" })
            })
            if (res.ok) { toast.success("Contenu supprimé"); router.refresh() }
        } catch { toast.error("Erreur") } finally { setLoadingId(null) }
    }
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "type",
            header: "Cible",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="uppercase text-xs font-bold tracking-wider text-text-muted bg-gray-100 px-2 py-1 rounded">
                        {row.original.target_type}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "reporter",
            header: "Signaleur",
            cell: ({ row }) => <span>{row.original.reporter?.username}</span>
        },
        {
            accessorKey: "reason",
            header: "Motif",
            cell: ({ row }) => <span className="font-medium text-error">{row.original.reason}</span>
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge type="report" status={row.original.status} />
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.created_at), 'dd/MM/yyyy HH:mm')}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const r = row.original
                return (
                    <div className="relative group inline-block text-left" tabIndex={0}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-focus-within:block w-48 bg-white border border-border shadow-lg rounded-md py-1">
                            {r.status !== 'dismissed' && r.status !== 'resolved' && (
                                <>
                                    <button
                                        onClick={() => handleDismiss(r.id)}
                                        disabled={loadingId === r.id}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left"
                                    >
                                        <EyeOff className="h-4 w-4" /> Ignorer
                                    </button>
                                    {r.target_type === 'profile' && (
                                        <button
                                            onClick={() => handleBan(r.id, r.target_id)}
                                            disabled={loadingId === r.id}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left"
                                        >
                                            <Shield className="h-4 w-4" /> Bannir l'user
                                        </button>
                                    )}
                                    {(r.target_type === 'listing') && (
                                        <button
                                            onClick={() => handleDelete(r.id, r.target_id)}
                                            disabled={loadingId === r.id}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left"
                                        >
                                            <Trash2 className="h-4 w-4" /> Supprimer l'annonce
                                        </button>
                                    )}
                                </>
                            )}
                            {(r.status === 'dismissed' || r.status === 'resolved') && (
                                <div className="px-4 py-2 text-xs text-text-muted text-center cursor-default">
                                    Déjà traité
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="reason" />
}
