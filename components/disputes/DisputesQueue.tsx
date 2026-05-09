"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Eye, Clock } from "lucide-react"
import { format, differenceInHours } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

export function DisputesQueue({ data }: { data: any[] }) {
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "created_at",
            header: "Ancienneté",
            cell: ({ row }) => {
                const hours = differenceInHours(new Date(), new Date(row.original.created_at))
                const isUrgent = hours > 48 && ['open', 'in_review'].includes(row.original.status)
                return (
                    <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${isUrgent ? 'text-error' : 'text-text-muted'}`} />
                        <span className={isUrgent ? 'text-error font-medium' : ''}>{hours}h</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "buyer",
            header: "Acheteur",
            cell: ({ row }) => {
                const buyer = row.original.transactions?.buyer || row.original.buyer
                return <span>{buyer?.username || 'N/A'}</span>
            }
        },
        {
            accessorKey: "seller",
            header: "Vendeur",
            cell: ({ row }) => {
                const seller = row.original.transactions?.seller || row.original.seller
                return <span>{seller?.username || 'N/A'}</span>
            }
        },
        {
            accessorKey: "reason",
            header: "Motif",
            cell: ({ row }) => <span className="font-medium">{row.original.reason}</span>
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge type="dispute" status={row.original.status} />
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Link href={`/disputes/${row.original.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" /> Traiter
                    </Button>
                </Link>
            ),
        },
    ]

    return <DataTable columns={columns} data={data} />
}
