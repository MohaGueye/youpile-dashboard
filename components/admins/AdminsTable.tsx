"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Shield, ShieldAlert, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export type AdminData = {
    id: string
    role: string
    created_at: string
    email: string
    username: string
}

export function AdminsTable({ initialAdmins, currentUserRole, currentUserId }: { initialAdmins: AdminData[], currentUserRole: string, currentUserId: string }) {
    const router = useRouter()
    const [isAddMode, setIsAddMode] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // Add form state
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [role, setRole] = React.useState("admin")

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentUserRole !== 'super_admin') {
            toast.error("Seuls les super_admins peuvent ajouter des administrateurs.")
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Administrateur ajouté avec succès")
                setIsAddMode(false)
                setEmail("")
                setPassword("")
                setRole("admin")
                router.refresh()
            } else {
                toast.error(data.error || "Erreur lors de l'ajout")
            }
        } catch {
            toast.error("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (adminId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet administrateur ?")) return
        if (currentUserRole !== 'super_admin') {
            toast.error("Non autorisé")
            return
        }
        try {
            const res = await fetch(`/api/admin/admins?id=${adminId}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok) {
                toast.success("Administrateur supprimé")
                router.refresh()
            } else {
                toast.error(data.error || "Erreur lors de la suppression")
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const handleChangeRole = async (adminId: string, newRole: string) => {
        if (!confirm(`Changer le rôle en ${newRole} ?`)) return
        if (currentUserRole !== 'super_admin') {
            toast.error("Non autorisé")
            return
        }
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminId, role: newRole })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Rôle mis à jour")
                router.refresh()
            } else {
                toast.error(data.error || "Erreur mise à jour")
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const columns: ColumnDef<AdminData>[] = [
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.email}</span>
                    <span className="text-xs text-text-muted">{row.original.username}</span>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Rôle",
            cell: ({ row }) => {
                const isAdmin = row.original.role === 'admin'
                return (
                    <Badge variant={isAdmin ? "outline" : "default"} className={isAdmin ? "" : "bg-purple-600 hover:bg-purple-700"}>
                        {isAdmin ? <Shield className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                        {row.original.role}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Ajouté le",
            cell: ({ row }) => <span>{format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: fr })}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const admin = row.original
                const isSelf = admin.id === currentUserId

                if (currentUserRole !== 'super_admin' || isSelf) return null

                return (
                    <div className="relative group inline-block text-left" tabIndex={0}>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-focus-within:block w-48 bg-white border border-border shadow-lg rounded-md py-1">
                            <button
                                onClick={() => handleChangeRole(admin.id, admin.role === 'admin' ? 'super_admin' : 'admin')}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left"
                            >
                                Passer en {admin.role === 'admin' ? 'Super Admin' : 'Admin'}
                            </button>
                            <button
                                onClick={() => handleDelete(admin.id)}
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Supprimer
                            </button>
                        </div>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-4">
            {currentUserRole === 'super_admin' && (
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsAddMode(!isAddMode)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {isAddMode ? "Annuler" : "Ajouter un Administrateur"}
                    </Button>
                </div>
            )}

            {isAddMode && (
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm mb-6">
                    <h3 className="text-lg font-medium mb-4">Nouvel Administrateur</h3>
                    <form onSubmit={handleAddAdmin} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mot de passe</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rôle</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="admin">Administrateur Standard</option>
                                <option value="super_admin">Super Administrateur</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Créer le compte"}
                        </Button>
                    </form>
                </div>
            )}

            <DataTable columns={columns} data={initialAdmins} searchKey="email" />
        </div>
    )
}
