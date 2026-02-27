import { createSupabaseServerClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/users/UsersTable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function UsersPage() {
    const supabase = createSupabaseServerClient()

    // Fetch profiles sorted by newest
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Utilisateurs</h1>
                <a href="/api/admin/export?table=users" target="_blank">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exporter CSV
                    </Button>
                </a>
            </div>

            <UsersTable data={users || []} />
        </div>
    )
}
