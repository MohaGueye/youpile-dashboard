"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pen, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BrandsTable({ data }: { data: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = React.useState<string | null>(null)
    const [isAddMode, setIsAddMode] = React.useState(false)
    const [name, setName] = React.useState("")
    const [logoUrl, setLogoUrl] = React.useState("")

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingId('add')
        try {
            const res = await fetch('/api/admin/catalog/brands', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, logo_url: logoUrl })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Marque ajoutée")
                setIsAddMode(false)
                setName("")
                setLogoUrl("")
                router.refresh()
            } else toast.error(data.error || "Erreur")
        } catch (err: any) { 
            console.error('Add brand error:', err)
            toast.error("Erreur réseau") 
        } finally { setLoadingId(null) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette marque ?")) return
        setLoadingId(id)
        try {
            const res = await fetch(`/api/admin/catalog/brands?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok) { 
                toast.success("Marque supprimée")
                router.refresh() 
            } else {
                toast.error(data.error || "Erreur lors de la suppression")
            }
        } catch (err) { 
            console.error('Delete brand error:', err)
            toast.error("Erreur réseau") 
        } finally { setLoadingId(null) }
    }

    const handleToggleActive = async (id: string, name: string, is_active: boolean) => {
        setLoadingId(id)
        try {
            const res = await fetch('/api/admin/catalog/brands', {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, is_active: !is_active })
            })
            const data = await res.json()
            if (res.ok) { 
                toast.success("Statut modifié")
                router.refresh() 
            } else {
                toast.error(data.error || "Erreur lors de la modification")
            }
        } catch (err) { 
            console.error('Toggle brand error:', err)
            toast.error("Erreur réseau") 
        } finally { setLoadingId(null) }
    }
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
            cell: ({ row }) => {
                try {
                    const dateStr = row.original.created_at
                    if (!dateStr) return <span className="text-xs text-text-muted">N/A</span>
                    const date = new Date(dateStr)
                    if (isNaN(date.getTime())) return <span className="text-xs text-text-muted">N/A</span>
                    return <span className="text-xs">{format(date, 'dd MMM yyyy', { locale: fr })}</span>
                } catch {
                    return <span className="text-xs text-text-muted">N/A</span>
                }
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                                onClick={() => handleToggleActive(row.original.id, row.original.name, row.original.is_active)}
                                disabled={loadingId === row.original.id}
                            >
                                <Pen className="mr-2 h-4 w-4" /> 
                                {row.original.is_active ? "Désactiver" : "Activer"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDelete(row.original.id)}
                                disabled={loadingId === row.original.id}
                                className="text-error focus:text-error"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAddMode(!isAddMode)} className="gap-2 bg-primary text-primary-dark">
                    <Plus className="h-4 w-4" /> {isAddMode ? "Annuler" : "Ajouter une marque"}
                </Button>
            </div>

            {isAddMode && (
                <div className="bg-white p-6 rounded-lg border border-border mt-4 mb-4">
                    <form onSubmit={handleAdd} className="space-y-4 max-w-sm">
                        <h4 className="font-semibold mb-2">Nouvelle Marque</h4>
                        <input
                            required value={name} onChange={e => setName(e.target.value)}
                            placeholder="Nom de la marque" className="w-full h-10 px-3 border rounded-md text-sm"
                        />
                        <input
                            value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                            placeholder="URL du logo (Optionnel)" className="w-full h-10 px-3 border rounded-md text-sm"
                        />
                        <Button type="submit" disabled={loadingId === 'add'}>Sauvegarder</Button>
                    </form>
                </div>
            )}

            <DataTable columns={columns} data={data} searchKey="name" />
        </div>
    )
}
