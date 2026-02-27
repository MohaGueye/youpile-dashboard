import { createSupabaseServerClient } from "@/lib/supabase/server"
import { CategoriesTree } from "@/components/catalog/CategoriesTree"

export default async function CategoriesPage() {
    const supabase = createSupabaseServerClient()

    const { data: categories } = await supabase
        .from('categories')
        .select('*')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des Catégories</h1>
            </div>

            <div className="max-w-3xl">
                <CategoriesTree categories={categories || []} />
            </div>
        </div>
    )
}
