import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ListingsTable } from "@/components/listings/ListingsTable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function ListingsPage() {
    const supabase = createSupabaseServerClient()

    // Fetch listings with relations
    const { data: listings } = await supabase
        .from('listings')
        .select(`
      *,
      profiles:seller_id (username),
      categories:category_id (name),
      listing_photos (photo_url)
    `)
        .order('created_at', { ascending: false })

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
