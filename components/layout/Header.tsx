"use client"

import { LogOut, Bell } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export function Header() {
    const [email, setEmail] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createSupabaseBrowserClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setEmail(data.user.email ?? "Admin")
                // Fetch role from admins table
                supabase
                    .from('admins')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()
                    .then(({ data: adminData }) => {
                        if (adminData) {
                            const roles: Record<string, string> = {
                                owner: "Propriétaire",
                                super_admin: "Super Admin",
                                admin: "Administrateur"
                            }
                            setRole(roles[adminData.role] || "Administrateur")
                        }
                    })
            }
        })
    }, [supabase])

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            toast.success("Déconnecté avec succès")
            router.push("/login")
            router.refresh()
        } else {
            toast.error("Erreur lors de la déconnexion")
        }
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-white px-6 shadow-sm">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
                <NotificationDropdown />

                <div className="flex items-center gap-3 border-l border-border pl-4">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-medium text-foreground">{email || "Chargement..."}</span>
                        <span className="text-xs text-text-muted">{role || "Administrateur"}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold">
                        {email ? email.charAt(0).toUpperCase() : "A"}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="ml-2 text-text-muted hover:text-error p-2 rounded-md hover:bg-red-50 transition-colors"
                        title="Se déconnecter"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
