import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, Mail, MapPin, Phone, Wallet } from "lucide-react"
import { UserModeration } from "@/components/users/UserModeration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListingsTable } from "@/components/listings/ListingsTable"
import { TransactionsTable } from "@/components/transactions/TransactionsTable"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseAdminClient()

    const [
        { data: profile },
        { count: activeListings },
        { count: totalTransactions },
        { data: reviews },
        { data: sellerListings },
        { data: userTransactions }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', params.id).eq('status', 'active'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).or(`buyer_id.eq.${params.id},seller_id.eq.${params.id}`),
        supabase.from('reviews').select('rating').eq('reviewed_id', params.id),
        supabase.from('listings').select(`*, categories(name), profiles(username), listing_photos(photo_url)`).eq('seller_id', params.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select(`*, buyer:buyer_id(username), seller:seller_id(username)`).or(`buyer_id.eq.${params.id},seller_id.eq.${params.id}`).order('created_at', { ascending: false })
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

            <div className="mt-8">
                <Tabs defaultValue="annonces" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0">
                        <TabsTrigger
                            value="annonces"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-medium text-text-muted data-[state=active]:text-primary-dark"
                        >
                            Ses Annonces
                        </TabsTrigger>
                        <TabsTrigger
                            value="transactions"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-medium text-text-muted data-[state=active]:text-primary-dark"
                        >
                            Ses Transactions
                        </TabsTrigger>
                    </TabsList>

                    <div className="pt-6">
                        <TabsContent value="annonces" className="m-0 focus-visible:outline-none">
                            <h3 className="text-lg font-semibold mb-4">Annonces publiées par {profile.username}</h3>
                            <div className="bg-white border text-sm border-border rounded-lg shadow-sm">
                                {sellerListings && sellerListings.length > 0 ? (
                                    <ListingsTable data={sellerListings} />
                                ) : (
                                    <div className="p-8 text-center text-text-muted">Cet utilisateur n'a publié aucune annonce.</div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="transactions" className="m-0 focus-visible:outline-none">
                            <h3 className="text-lg font-semibold mb-4">Historique des transactions de {profile.username}</h3>
                            <div className="bg-white border text-sm border-border rounded-lg shadow-sm">
                                {userTransactions && userTransactions.length > 0 ? (
                                    <TransactionsTable data={userTransactions} />
                                ) : (
                                    <div className="p-8 text-center text-text-muted">Cet utilisateur n'a aucune transaction.</div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

        </div>
    )
}
