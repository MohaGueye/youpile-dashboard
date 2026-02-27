"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ShieldCheck, UserX, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface UserModerationProps {
    userId: string
    isBanned: boolean
    isVerified: boolean
}

export function UserModeration({ userId, isBanned, isVerified }: UserModerationProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleAction = async (action: 'ban' | 'verify', value: boolean) => {
        setLoading(true)
        const endpoint = action === 'ban' ? '/api/admin/ban-user' : '/api/admin/verify-user'
        const payload = action === 'ban' ? { user_id: userId, ban: value } : { user_id: userId, verify: value }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(value ? `${action === 'ban' ? 'Utilisateur banni' : 'Utilisateur vérifié'}` : `${action === 'ban' ? 'Bannissement levé' : 'Vérification retirée'}`)
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.error || "Une erreur est survenue")
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Actions de Modération</h3>
            <div className="flex flex-col gap-3">
                {isVerified ? (
                    <Button
                        variant="outline"
                        className="w-full justify-start text-text-muted"
                        onClick={() => handleAction('verify', false)}
                        disabled={loading}
                    >
                        <ShieldAlert className="h-5 w-5 mr-2" />
                        Retirer la vérification
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full justify-start text-blue-600 border-blue-200 bg-blue-50"
                        onClick={() => handleAction('verify', true)}
                        disabled={loading}
                    >
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        Vérifier le profil
                    </Button>
                )}

                {isBanned ? (
                    <Button
                        variant="outline"
                        className="w-full justify-start text-success border-success/20 bg-success/5"
                        onClick={() => handleAction('ban', false)}
                        disabled={loading}
                    >
                        <UserCheck className="h-5 w-5 mr-2" />
                        Débloquer l'utilisateur
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full justify-start text-error border-error/20 bg-error/5"
                        onClick={() => handleAction('ban', true)}
                        disabled={loading}
                    >
                        <UserX className="h-5 w-5 mr-2" />
                        Bannir l'utilisateur
                    </Button>
                )}
            </div>
        </div>
    )
}
