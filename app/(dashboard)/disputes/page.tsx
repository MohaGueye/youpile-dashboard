import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { DisputesQueue } from "@/components/disputes/DisputesQueue"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function DisputesPage() {
    const supabase = createSupabaseAdminClient()

    // Fetch disputes sorted by oldest first to process urgent ones
    const { data: disputes, error } = await supabase
        .from('disputes')
        .select(`
            *,
            transactions:transaction_id (
                buyer:buyer_id (username),
                seller:seller_id (username)
            ),
            opened_by_profile:opened_by (username)
        `)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Disputes fetch error:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">File des Litiges</h1>
                <a href="/api/admin/export?table=disputes" target="_blank">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                </a>
            </div>

            <DisputesQueue data={disputes || []} />
        </div>
    )
}
