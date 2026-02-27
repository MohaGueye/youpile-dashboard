import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ReportsTable } from "@/components/reports/ReportsTable"

export default async function ReportsPage() {
    const supabase = createSupabaseServerClient()

    // Fetch pending reports
    const { data: reports } = await supabase
        .from('reports')
        .select(`
      *,
      reporter:reporter_id (username)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Modération & Signalements</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                <div className="flex space-x-2 text-sm mb-4">
                    <span className="font-semibold text-primary-dark border-b-2 border-primary pb-2">File d'attente globale</span>
                </div>
                <ReportsTable data={reports || []} />
            </div>
        </div>
    )
}
