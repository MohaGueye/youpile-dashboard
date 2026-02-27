import { createSupabaseServerClient } from "@/lib/supabase/server"
import { PayoutsTable } from "@/components/finance/PayoutsTable"
import { Wallet, PiggyBank, ArrowDownRight } from "lucide-react"

export default async function FinancePage() {
    const supabase = createSupabaseServerClient()

    // KPI Fetch (simplified values)
    const [
        { data: activeEscrows },
        { data: historyRecords }
    ] = await Promise.all([
        supabase.from('transactions').select('amount').eq('status', 'escrow'),
        // Get all pending withdrawals (assuming app creates debit in wallet_history with status pending)
        supabase.from('wallet_history').select(`
      *,
      profiles:user_id (username, phone)
    `).eq('type', 'debit').order('created_at', { ascending: false })
    ])

    const totalEscrow = activeEscrows?.reduce((acc, curr) => acc + curr.amount, 0) || 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance & Trésorerie</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl">
                    <div className="flex items-center gap-3 text-primary-dark font-medium mb-3">
                        <PiggyBank className="h-5 w-5" /> Frais Plateforme (Mois)
                    </div>
                    <div className="text-3xl font-bold text-foreground">32 400 XOF</div>
                    <div className="text-xs text-text-muted mt-2">Dernière mise à jour : Aujourd'hui</div>
                </div>

                <div className="bg-orange-50 border border-warning/30 p-6 rounded-xl">
                    <div className="flex items-center gap-3 text-warning font-medium mb-3">
                        <Wallet className="h-5 w-5" /> Trésorerie Séquestrée (Escrow)
                    </div>
                    <div className="text-3xl font-bold text-foreground">{totalEscrow.toLocaleString('fr-FR')} XOF</div>
                    <div className="text-xs text-text-muted mt-2">Volume bloqué sur les transactions en cours</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                    <div className="flex items-center gap-3 text-blue-700 font-medium mb-3">
                        <ArrowDownRight className="h-5 w-5" /> Retraits en attente
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                        {historyRecords?.filter(r => r.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('fr-FR') || 0} XOF
                    </div>
                    <div className="text-xs text-text-muted mt-2">Liquidé requis pour les vendeurs</div>
                </div>
            </div>

            <PayoutsTable data={historyRecords || []} />
        </div>
    )
}
