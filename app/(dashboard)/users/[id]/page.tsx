import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, Mail, MapPin, Phone, Wallet } from "lucide-react"
import { UserModeration } from "@/components/users/UserModeration"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServerClient()

    const [
        { data: profile },
        { count: activeListings },
        { count: totalTransactions },
        { data: reviews }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', params.id).eq('status', 'active'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).or(`buyer_id.eq.${params.id},seller_id.eq.${params.id}`),
        supabase.from('reviews').select('rating').eq('reviewed_id', params.id)
    ])

    if (!profile) return notFound()

    const avgRating = reviews?.length ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 'N/A'

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden shadow-sm flex-shrink-0">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="object-cover h-full w-full" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                                {profile.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {profile.username}
                            {profile.is_verified && <ShieldCheck className="h-5 w-5 text-blue-500" />}
                            {profile.is_banned && <Badge variant="error" className="ml-2">Banni</Badge>}
                        </h1>
                        <p className="text-text-muted mt-1">{profile.bio || "Aucune biographie"}</p>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</div>
                            {profile.phone && <div className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {profile.phone}</div>}
                            {profile.location && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.location}</div>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[240px]">
                    <div className="bg-surface p-4 rounded-lg flex items-center justify-between border border-border">
                        <div className="flex items-center gap-2 text-text-muted">
                            <Wallet className="h-5 w-5 text-primary-dark" />
                            <span className="font-medium text-sm">Solde</span>
                        </div>
                        <div className="font-bold text-lg text-foreground">{profile.wallet_balance} XOF</div>
                    </div>

                    <UserModeration
                        userId={params.id}
                        isBanned={!!profile.is_banned}
                        isVerified={!!profile.is_verified}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">{activeListings || 0}</div>
                        <div className="text-sm font-medium text-text-muted mt-1">Annonces Actives</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">{totalTransactions || 0}</div>
                        <div className="text-sm font-medium text-text-muted mt-1">Transactions Multiples</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-emerald-600">{avgRating}</div>
                        <div className="text-sm font-medium text-text-muted mt-1">Note Moyenne</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 border-b border-border">
                <div className="flex gap-6 pb-px overflow-x-auto text-sm font-medium">
                    <div className="border-b-2 border-primary text-primary-dark pb-3 px-1">Aperçu & Annonces</div>
                    {/* For real implementation we'd use tabs, keeping it simple mapped view for now */}
                </div>
            </div>

            <div className="py-6">
                <h3 className="text-lg font-semibold mb-4">Dernières transactions de cet utilisateur</h3>
                <div className="text-sm text-text-muted bg-surface p-6 rounded-lg border border-border text-center">
                    L'intégration des onglets complets se fera via des sous-composants dédiés. (Vue simplifiée)
                </div>
            </div>

        </div>
    )
}
