import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    // 1. Check Auth & Admin
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { session }, error: authError } = await supabaseAdmin.auth.getSession()
    // For API calls from client components, we get the session cookie automatically via createServerClient
    // Let's ensure the user is an admin
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

    try {
        // Fetch all admins
        const { data: admins, error: adminsError } = await supabaseAdmin
            .from('admins')
            .select(`
                id,
                role,
                created_at,
                profiles:profiles(email, username, avatar_url)
            `)

        if (adminsError) throw adminsError

        return NextResponse.json(admins)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData || adminData.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden: Super Admins only can add admins' }, { status: 403 })
    }

    try {
        const { email, password, role } = await request.json()

        // 1. Create User in Auth
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (authError) throw authError

        const newUserId = newAuthUser.user.id

        // 2. Add to Admins table
        const { error: insertError } = await supabaseAdmin.from('admins').insert({
            id: newUserId,
            role: role || 'admin'
        })

        if (insertError) {
            // Rollback Auth user if inserting into admins fail
            await supabaseAdmin.auth.admin.deleteUser(newUserId)
            throw insertError
        }

        return NextResponse.json({ success: true, id: newUserId })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData || adminData.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden: Super Admins only can edit roles' }, { status: 403 })
    }

    try {
        const { admin_id, role } = await request.json()

        if (admin_id === user.id) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
        }

        const { error: updateError } = await supabaseAdmin
            .from('admins')
            .update({ role })
            .eq('id', admin_id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData || adminData.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden: Super Admins only can delete admins' }, { status: 403 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const admin_id = searchParams.get('id')

        if (!admin_id) return NextResponse.json({ error: 'Missing admin_id' }, { status: 400 })
        if (admin_id === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

        // Delete from Auth (this cascades to profiles and admins tables generally if setup correctly, 
        // but let's delete explicitly if needed, deleting from auth is usually enough)

        // Delete from admins first explicitly to be safe
        const { error: deleteAdminError } = await supabaseAdmin.from('admins').delete().eq('id', admin_id)
        if (deleteAdminError) throw deleteAdminError

        // Delete from auth
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(admin_id)
        if (deleteAuthError) throw deleteAuthError

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
