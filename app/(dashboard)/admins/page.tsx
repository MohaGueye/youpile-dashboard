import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server"
import { AdminsTable } from "@/components/admins/AdminsTable"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminsPage() {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: currentAdmin } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!currentAdmin) redirect('/login')

    // Fetch all admins
    const { data: adminsData } = await supabaseAdmin
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch profiles for usernames
    const { data: profilesData } = await supabaseAdmin
        .from('profiles')
        .select('id, username')

    // Fetch auth users for emails
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers()

    // Merge data
    const formattedAdmins = (adminsData || []).map(admin => {
        const profile = profilesData?.find(p => p.id === admin.id)
        const authUser = authUsers?.find(u => u.id === admin.id)
        
        return {
            id: admin.id,
            role: admin.role,
            created_at: admin.created_at,
            email: authUser?.email || 'N/A',
            username: profile?.username || authUser?.email?.split('@')[0] || 'Admin',
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
