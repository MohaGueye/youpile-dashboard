"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Listing } from "@/lib/types"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Trash2, PauseCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function ListingsTable({ data }: { data: any[] }) {
    const router = useRouter()

    const handleStatusChange = async (listingId: string, status: string, isDelete = false) => {
        try {
            if (isDelete) {
                if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
                const res = await fetch('/api/admin/delete-listing', {
                    method: 'POST',
                    body: JSON.stringify({ listing_id: listingId, reason: "Violation des CGU" })
                })
                if (res.ok) { toast.success("Annonce supprimée"); router.refresh() }
            } else {
                // Direct update via pseudo-api or generic update (simplified for UI demonstration)
                toast.error("Endpoint générique de MAJ non implémenté - Use Delete")
            }
        } catch {
            toast.error("Erreur")
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "title",
            header: "Annonce",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 max-w-xs">
                    <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {row.original.listing_photos?.[0]?.photo_url ? (
                            <img src={row.original.listing_photos[0].photo_url} alt="" className="object-cover h-full w-full" />
                        ) : (
                            <Eye className="h-4 w-4 m-auto text-gray-400 mt-4" />
                        )}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="font-medium truncate" title={row.original.title}>{row.original.title}</span>
                        <span className="text-xs text-text-muted">{row.original.categories?.name || 'Sans cat'}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "seller",
            header: "Vendeur",
            cell: ({ row }) => <span>{row.original.profiles?.username || row.original.seller_id}</span>
        },
        {
            accessorKey: "price",
            header: "Prix",
            cell: ({ row }) => <span className="font-bold">{row.original.price} XOF</span>
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge type="listing" status={row.original.status} />
        },
        {
            accessorKey: "stats",
            header: "Stats",
            cell: ({ row }) => (
                <div className="text-xs text-text-muted">
                    <span title="Vues">👁 {row.original.views_count}</span>{' '}
                    <span title="Likes" className="ml-2">❤️ {row.original.likes_count}</span>
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span>{format(new Date(row.original.created_at), 'dd MMM', { locale: fr })}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const u = row.original
                return (
                    <div className="relative group inline-block text-left" tabIndex={0}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-focus-within:block w-48 bg-white border border-border shadow-lg rounded-md py-1">
                            <Link href={`/listings/${u.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                <Eye className="h-4 w-4" /> Voir le détail
                            </Link>
                            {u.status !== 'deleted' && (
                                <button onClick={() => handleStatusChange(u.id, 'deleted', true)} className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left">
                                    <Trash2 className="h-4 w-4" /> Supprimer
                                </button>
                            )}
                        </div>
                    </div>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="title" />
}
