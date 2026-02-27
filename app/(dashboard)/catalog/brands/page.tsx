import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BrandsTable } from "@/components/catalog/BrandsTable"

export default async function BrandsPage() {
    const supabase = createSupabaseServerClient()

    const { data: brands } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des Marques</h1>
            </div>

            <BrandsTable data={brands || []} />
        </div>
    )
}
