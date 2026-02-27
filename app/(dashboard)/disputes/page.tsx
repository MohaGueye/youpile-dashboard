import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DisputesQueue } from "@/components/disputes/DisputesQueue"

export default async function DisputesPage() {
    const supabase = createSupabaseServerClient()

    // Fetch disputes sorted by oldest first to process urgent ones
    const { data: disputes } = await supabase
        .from('disputes')
        .select(`
      *,
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">File des Litiges</h1>
            </div>

            <DisputesQueue data={disputes || []} />
        </div>
    )
}
