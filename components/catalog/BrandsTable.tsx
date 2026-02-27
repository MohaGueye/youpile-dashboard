"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pen, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function BrandsTable({ data }: { data: any[] }) {
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "logo",
            header: "Logo",
            cell: ({ row }) => (
                <div className="h-10 w-10 rounded-md bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {row.original.logo_url ? (
                        <img src={row.original.logo_url} className="h-full w-full object-contain p-1" alt="" />
                    ) : (
                        <span className="text-gray-400 text-xs text-center leading-tight">Sans logo</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: "name",
            header: "Marque",
            cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
        },
        {
            accessorKey: "is_active",
            header: "Statut",
            cell: ({ row }) => (
                row.original.is_active ?
                    <span className="text-success text-xs font-bold uppercase tracking-wider bg-success/10 px-2 py-1 rounded">Active</span> :
                    <span className="text-text-muted text-xs font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">Désactivée</span>
            )
        },
        {
            accessorKey: "created_at",
            header: "Date d'ajout",
            cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: fr })}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="relative group inline-block text-left" tabIndex={0}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-focus-within:block w-48 bg-white border border-border shadow-lg rounded-md py-1">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                <Pen className="h-4 w-4" /> Modifier
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left">
                                <Trash2 className="h-4 w-4" /> Supprimer
                            </button>
                        </div>
                    </div>
                )
            },
        },
    ]

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button className="gap-2 bg-primary text-primary-dark"><Plus className="h-4 w-4" /> Ajouter une marque</Button>
            </div>
            <DataTable columns={columns} data={data} searchKey="name" />
        </div>
    )
}
