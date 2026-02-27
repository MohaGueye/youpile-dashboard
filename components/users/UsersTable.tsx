"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Profile } from "@/lib/types"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function UsersTable({ data }: { data: Profile[] }) {
    const router = useRouter()

    const handleBan = async (userId: string, ban: boolean) => {
        try {
            const res = await fetch('/api/admin/ban-user', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, ban })
            })
            if (res.ok) {
                toast.success(ban ? "Utilisateur suspendu" : "Suspension levée")
                router.refresh()
            } else {
                toast.error("Erreur serveur")
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const handleVerify = async (userId: string, verify: boolean) => {
        try {
            const res = await fetch('/api/admin/verify-user', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, verify })
            })
            if (res.ok) {
                toast.success(verify ? "Badge vérifié accordé" : "Badge vérifié retiré")
                router.refresh()
            } else {
                toast.error("Erreur serveur")
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const columns: ColumnDef<Profile>[] = [
        {
            accessorKey: "username",
            header: "Utilisateur",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {row.original.avatar_url ? (
                            <img src={row.original.avatar_url} alt="Avatar" className="object-cover h-full w-full" />
                        ) : (
                            <span className="text-gray-500 font-medium text-xs">
                                {row.original.username?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.username}</span>
                        <span className="text-xs text-text-muted">{row.original.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Inscription",
            cell: ({ row }) => <span>{format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: fr })}</span>
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => {
                const u = row.original
                return (
                    <div className="flex gap-1.5">
                        {u.is_banned ? (
                            <Badge variant="error">Banni</Badge>
                        ) : (
                            <Badge variant="success">Actif</Badge>
                        )}
                        {u.is_verified && <Badge variant="default" className="bg-blue-500">Vérifié</Badge>}
                    </div>
                )
            }
        },
        {
            accessorKey: "wallet_balance",
            header: "Portefeuille",
            cell: ({ row }) => <span className="font-medium text-text-secondary">{row.original.wallet_balance} XOF</span>
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
                            <Link href={`/users/${u.id}`} className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                Voir la fiche
                            </Link>
                            <button onClick={() => handleBan(u.id, !u.is_banned)} className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                {u.is_banned ? "Lever la suspension" : "Suspendre"}
                            </button>
                            <button onClick={() => handleVerify(u.id, !u.is_verified)} className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100 w-full text-left">
                                {u.is_verified ? "Retirer badge vérifié" : "Accorder badge vérifié"}
                            </button>
                        </div>
                    </div>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="username" />
}
