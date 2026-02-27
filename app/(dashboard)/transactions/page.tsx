import { createSupabaseServerClient } from "@/lib/supabase/server"
import { TransactionsTable } from "@/components/transactions/TransactionsTable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function TransactionsPage() {
    const supabase = createSupabaseServerClient()

    // Fetch transactions with relations
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
      *,
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions Financières</h1>
                <a href="/api/admin/export?table=transactions" target="_blank">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                </a>
            </div>

            <TransactionsTable data={transactions || []} />
        </div>
    )
}
