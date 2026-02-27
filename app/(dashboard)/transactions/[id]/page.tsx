import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServerClient()

    const { data: transaction } = await supabase
        .from('transactions')
        .select(`
      *,
      buyer:buyer_id (username, email),
      seller:seller_id (username, email),
      listing:listing_id (title, price, listing_photos(photo_url))
    `)
        .eq('id', params.id)
        .single()

    if (!transaction) return notFound()

    // Just fetch latest shipment if any
    const { data: shipment } = await supabase
        .from('shipments')
        .select('*')
        .eq('transaction_id', transaction.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-bold font-mono">#{transaction.id.substring(0, 8)}</h1>
                    <div className="text-sm text-text-muted mt-1">
                        Créée le {format(new Date(transaction.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                </div>
                <StatusBadge type="transaction" status={transaction.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Détails Financiers</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-text-muted">Montant Payé (Acheteur)</dt>
                            <dd className="font-bold">{transaction.amount} XOF</dd>
                        </div>
                        <div className="flex justify-between items-center text-error border-b border-dashed pb-2">
                            <dt className="text-text-muted">Frais Plateforme Youpile</dt>
                            <dd>- {transaction.fees} XOF</dd>
                        </div>
                        <div className="flex justify-between pt-1">
                            <dt className="text-text-muted">Net à verser (Vendeur)</dt>
                            <dd className="font-bold text-success text-base">{transaction.net_amount} XOF</dd>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="flex justify-between">
                                <dt className="text-text-muted">Méthode de Paiement</dt>
                                <dd className="font-medium uppercase">{transaction.payment_method || 'Non spécifié'}</dd>
                            </div>
                            <div className="flex justify-between mt-2">
                                <dt className="text-text-muted">ID Charge Bictorys</dt>
                                <dd className="font-mono text-xs">{transaction.bictorys_charge_id || 'N/A'}</dd>
                            </div>
                        </div>
                    </dl>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Intervenants</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-semibold text-text-muted uppercase mb-1">Acheteur</div>
                                <div className="font-medium text-blue-600 hover:underline">
                                    <a href={`/users/${transaction.buyer_id}`}>{transaction.buyer?.username}</a>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-text-muted uppercase mb-1">Vendeur</div>
                                <div className="font-medium text-orange-600 hover:underline">
                                    <a href={`/users/${transaction.seller_id}`}>{transaction.seller?.username}</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Expédition</h3>
                        {shipment ? (
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-text-muted">Transporteur</dt>
                                    <dd className="font-medium">{shipment.carrier}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-text-muted">N° Suivi</dt>
                                    <dd className="font-mono text-xs">{shipment.tracking_number || 'En attente'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-text-muted">Statut Livraison</dt>
                                    <dd className="font-medium"><Badge variant="outline">{shipment.status}</Badge></dd>
                                </div>
                            </dl>
                        ) : (
                            <div className="text-sm text-text-muted italic">Aucune information d'expédition pour le moment.</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
