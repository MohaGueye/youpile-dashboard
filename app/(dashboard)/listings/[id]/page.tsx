import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { ListingModeration } from "@/components/listings/ListingModeration"

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServerClient()

    const { data: listing } = await supabase
        .from('listings')
        .select(`
      *,
      profiles:seller_id (username, avatar_url, is_verified),
      categories:category_id (name),
      brands:brand_id (name),
      listing_photos (photo_url)
    `)
        .eq('id', params.id)
        .single()

    if (!listing) return notFound()

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{listing.title}</h1>
                    <StatusBadge status={listing.status} type="listing" />
                </div>
                <div className="text-2xl font-bold text-primary-dark">{listing.price} XOF</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-lg mb-3">Galerie</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {listing.listing_photos && listing.listing_photos.length > 0 ? (
                            listing.listing_photos.map((photo: any, i: number) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-border">
                                    <img src={photo.photo_url} alt="Listing photo" className="h-full w-full object-cover" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 h-32 flex items-center justify-center bg-surface border border-dashed rounded-lg text-text-muted">
                                Aucune photo
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h3 className="font-semibold text-lg mb-2">Description</h3>
                        <p className="text-text-secondary whitespace-pre-wrap bg-surface p-4 rounded-lg">{listing.description}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Informations Vendeur</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                {listing.profiles?.avatar_url && <img src={listing.profiles.avatar_url} className="h-full w-full object-cover" alt="" />}
                            </div>
                            <div>
                                <div className="font-medium">{listing.profiles?.username}</div>
                                <div className="text-xs text-text-muted">ID: {listing.seller_id}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Détails de l'article</h3>
                        <dl className="grid grid-cols-2 gap-y-4">
                            <div>
                                <dt className="text-sm text-text-muted">Catégorie</dt>
                                <dd className="font-medium mt-1">{listing.categories?.name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-text-muted">Marque</dt>
                                <dd className="font-medium mt-1">{listing.brands?.name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-text-muted">Taille</dt>
                                <dd className="font-medium mt-1">{listing.size || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-text-muted">État</dt>
                                <dd className="font-medium mt-1 uppercase text-xs tracking-wider">{listing.condition.replace('_', ' ')}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-text-muted">Couleur</dt>
                                <dd className="font-medium mt-1 flex items-center gap-2">
                                    {listing.color || 'N/A'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="flex gap-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <div className="flex-1 text-center border-r border-blue-200">
                            <div className="text-2xl font-bold">{listing.views_count}</div>
                            <div className="text-xs uppercase">Vues</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-bold">{listing.likes_count}</div>
                            <div className="text-xs uppercase">Favoris</div>
                        </div>
                    </div>

                    <ListingModeration
                        listingId={params.id}
                        title={listing.title}
                        currentStatus={listing.status}
                    />
                </div>
            </div>
        </div>
    )
}
