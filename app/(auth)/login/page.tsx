"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

function LoginContent() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createSupabaseBrowserClient()

    useEffect(() => {
        const errorMsg = searchParams?.get('error')
        if (errorMsg) {
            toast.error(errorMsg)
        }
    }, [searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (data.user) {
                // Verify admin exists in DB
                const { data: adminData, error: adminError } = await supabase
                    .from('admins')
                    .select('id')
                    .eq('id', data.user.id)
                    .single()

                if (adminError || !adminData) {
                    await supabase.auth.signOut()
                    toast.error("Accès refusé. Réservé aux administrateurs.")
                    setLoading(false)
                    return
                }

                toast.success("Connexion réussie")
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            toast.error("Une erreur est survenue")
        } finally {
            if (!loading) { // if not redirected away completely
                setLoading(false)
            }
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-border">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
                        <span className="text-xl font-bold text-white">Y</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Youpile Admin
                    </h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Connectez-vous pour accéder au panel
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Adresse email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md border border-border px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white"
                                placeholder="admin@youpile.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border border-border px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
