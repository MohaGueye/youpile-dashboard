import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { ListingsTable } from "@/components/listings/ListingsTable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function ListingsPage() {
    const supabase = createSupabaseAdminClient()

    // Fetch listings with relations (excluding deleted ones)
    const { data: listings, error } = await supabase
        .from('listings')
        .select(`
            *,
            profiles:user_id (username),
            categories:category_id (name),
            listing_photos (url)
        `)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Listings fetch error:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Annonces</h1>
                <a href="/api/admin/export?table=listings" target="_blank">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                </a>
            </div>

            <ListingsTable data={listings || []} />
        </div>
    )
}
