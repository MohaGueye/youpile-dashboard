"use client"

import { LogOut, Bell } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export function Header() {
    const [email, setEmail] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createSupabaseBrowserClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setEmail(data.user.email ?? "Admin")
            }
        })
    }, [supabase.auth])

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
                <button className="text-text-muted hover:text-foreground relative p-2">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
                </button>

                <div className="flex items-center gap-3 border-l border-border pl-4">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-medium text-foreground">{email || "Chargement..."}</span>
                        <span className="text-xs text-text-muted">Administrateur</span>
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
