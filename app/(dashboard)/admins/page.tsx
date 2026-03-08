import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { AdminsTable } from "@/components/admins/AdminsTable"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminsPage() {
    const supabaseAdmin = createSupabaseAdminClient()

    // Auth check
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) redirect('/login')

    const { data: currentAdmin } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!currentAdmin) redirect('/login')

    // Fetch admins manually
    // We join with profiles using the id since admins.id = profiles.id
    const { data: admins } = await supabaseAdmin
        .from('admins')
        .select(`
            id,
            role,
            created_at,
            profiles(email, username, avatar_url)
        `)
        .order('created_at', { ascending: false })

    // Safe formatting for the table
    const formattedAdmins = (admins || []).map(admin => {
        // Handle array or single object from the join
        const profile = Array.isArray(admin.profiles) ? admin.profiles[0] : admin.profiles;
        return {
            id: admin.id,
            role: admin.role,
            created_at: admin.created_at,
            email: profile?.email || 'N/A',
            username: profile?.username || 'Utilisateur inconnu',
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Administrateurs</h1>
            </div>

            <AdminsTable initialAdmins={formattedAdmins} currentUserRole={currentAdmin.role} currentUserId={user.id} />
        </div>
    )
}
