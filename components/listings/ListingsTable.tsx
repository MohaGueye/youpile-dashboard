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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ListingsTable({ data }: { data: any[] }) {
    const router = useRouter()

    const handleStatusChange = async (listingId: string, status: string, isDelete = false) => {
        try {
            if (isDelete) {
                if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
                const res = await fetch('/api/admin/delete-listing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listing_id: listingId, reason: "Violation des CGU" })
                })
                const result = await res.json()
                if (res.ok) { 
                    toast.success("Annonce supprimée")
                    router.refresh() 
                } else {
                    toast.error(result.error || "Erreur")
                }
            }
        } catch (err) {
            console.error('Status change error:', err)
            toast.error("Erreur réseau")
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "title",
            header: "Annonce",
            cell: ({ row }) => (
                <div className="flex items-center gap-3 max-w-xs">
                    <div className="h-12 w-12 rounded bg-gray-100 border border-border overflow-hidden flex-shrink-0">
                        {row.original.listing_photos?.[0]?.url ? (
                            <img src={row.original.listing_photos[0].url} alt="" className="object-cover h-full w-full" />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-gray-50">
                                <Eye className="h-4 w-4 text-gray-300" />
                            </div>
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
            cell: ({ row }) => <span>{row.original.profiles?.username || 'N/A'}</span>
        },
        {
            accessorKey: "price",
            header: "Prix",
            cell: ({ row }) => <span className="font-bold">{row.original.price?.toLocaleString()} XOF</span>
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
                    <span title="Vues">👁 {row.original.views_count || 0}</span>{' '}
                    <span title="Likes" className="ml-2">❤️ {row.original.likes_count || 0}</span>
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.original.created_at)
                return <span>{isNaN(date.getTime()) ? 'N/A' : format(date, 'dd MMM', { locale: fr })}</span>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const u = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/listings/${u.id}`} className="flex items-center w-full">
                                    <Eye className="mr-2 h-4 w-4" /> Voir le détail
                                </Link>
                            </DropdownMenuItem>
                            {u.status !== 'deleted' && (
                                <DropdownMenuItem 
                                    onClick={() => handleStatusChange(u.id, 'deleted', true)}
                                    className="text-error focus:text-error"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="title" />
}
