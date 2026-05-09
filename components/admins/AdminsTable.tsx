"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Shield, ShieldAlert, ShieldCheck, Trash2, Pen } from "lucide-react"
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

export type AdminData = {
    id: string
    role: string
    created_at: string
    email: string
    username: string
}

const ROLE_LABELS: Record<string, { label: string, color: string, icon: any }> = {
    owner: { label: "Propriétaire", color: "bg-red-600 hover:bg-red-700", icon: ShieldAlert },
    super_admin: { label: "Super Admin", color: "bg-purple-600 hover:bg-purple-700", icon: ShieldCheck },
    admin: { label: "Admin", color: "bg-blue-600 hover:bg-blue-700", icon: Shield },
}

export function AdminsTable({ initialAdmins, currentUserRole, currentUserId }: { initialAdmins: AdminData[], currentUserRole: string, currentUserId: string }) {
    const router = useRouter()
    const [isAddMode, setIsAddMode] = React.useState(false)
    const [editingAdmin, setEditingAdmin] = React.useState<AdminData | null>(null)
    const [loading, setLoading] = React.useState(false)

    // Add form state
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [role, setRole] = React.useState("admin")

    // Edit form state
    const [editUsername, setEditUsername] = React.useState("")
    const [editRole, setEditRole] = React.useState("")

    React.useEffect(() => {
        if (editingAdmin) {
            setEditUsername(editingAdmin.username)
            setEditRole(editingAdmin.role)
        }
    }, [editingAdmin])

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentUserRole === 'admin') {
            toast.error("Non autorisé")
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

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAdmin) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    admin_id: editingAdmin.id, 
                    role: editRole !== editingAdmin.role ? editRole : undefined,
                    username: editUsername !== editingAdmin.username ? editUsername : undefined
                })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Administrateur modifié")
                setEditingAdmin(null)
                router.refresh()
            } else {
                toast.error(data.error || "Erreur lors de la modification")
            }
        } catch {
            toast.error("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (adminId: string, adminRole: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet administrateur ?")) return
        
        // Hierarchy check
        if (currentUserRole === 'admin') {
            toast.error("Non autorisé")
            return
        }
        if (currentUserRole === 'super_admin' && (adminRole === 'owner' || adminRole === 'super_admin')) {
            toast.error("Vous ne pouvez supprimer que les Admins standards")
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
                const roleData = ROLE_LABELS[row.original.role] || { label: row.original.role, color: "bg-gray-500", icon: Shield }
                const Icon = roleData.icon
                return (
                    <Badge className={`${roleData.color} text-white border-none gap-1`}>
                        <Icon className="h-3 w-3" />
                        {roleData.label}
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

                // Hierarchy check for actions
                const canManage = currentUserRole === 'owner' || 
                    (currentUserRole === 'super_admin' && admin.role === 'admin')

                if (!canManage || isSelf) return null

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAdmin(admin)}>
                                <Pen className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDelete(admin.id, admin.role)}
                                className="text-red-600 focus:text-red-600"
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
        <div className="space-y-4">
            {currentUserRole !== 'admin' && (
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
                                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mot de passe</label>
                            <input
                                type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rôle</label>
                            <select
                                value={role} onChange={e => setRole(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="admin">Administrateur Standard</option>
                                {currentUserRole === 'owner' && (
                                    <>
                                        <option value="super_admin">Super Administrateur</option>
                                        <option value="owner">Propriétaire</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Créer le compte"}
                        </Button>
                    </form>
                </div>
            )}

            {editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-lg border border-border shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Modifier Administrateur</h3>
                        <form onSubmit={handleEditAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email (Lecture seule)</label>
                                <input type="text" disabled value={editingAdmin.email} className="w-full flex h-10 rounded-md border bg-gray-50 px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                                <input
                                    type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)}
                                    className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rôle</label>
                                <select
                                    value={editRole} onChange={e => setEditRole(e.target.value)}
                                    className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="admin">Administrateur Standard</option>
                                    {currentUserRole === 'owner' && (
                                        <>
                                            <option value="super_admin">Super Administrateur</option>
                                            <option value="owner">Propriétaire</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setEditingAdmin(null)}>Annuler</Button>
                                <Button type="submit" disabled={loading}>Enregistrer</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DataTable columns={columns} data={initialAdmins} searchKey="email" />
        </div>
    )
}
