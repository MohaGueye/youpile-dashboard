import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    // 1. Check Auth & Admin
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    
    const { data: { user } } = await supabase.auth.getUser()
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
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const currentUserRole = adminData.role // 'owner', 'super_admin', 'admin'

    try {
        const { email, password, role } = await request.json()

        // Role Validation Logic
        if (currentUserRole === 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins cannot create other admins' }, { status: 403 })
        }

        if (currentUserRole === 'super_admin') {
            if (role === 'owner' || role === 'super_admin') {
                return NextResponse.json({ error: 'Forbidden: Super Admins can only create standard Admins' }, { status: 403 })
            }
        }

        // Only owners can create owners or super admins
        if (role === 'owner' || role === 'super_admin') {
            if (currentUserRole !== 'owner') {
                return NextResponse.json({ error: 'Forbidden: Only Owners can create Owners or Super Admins' }, { status: 403 })
            }
        }

        // 1. Create User in Auth
        console.log('Attempting to create auth user:', email)
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })
        
        if (authError) {
            console.error('Auth creation error:', authError)
            return NextResponse.json({ 
                error: `Erreur lors de la création du compte Auth: ${authError.message}`,
                details: authError 
            }, { status: 400 })
        }

        if (!newAuthUser.user) {
            return NextResponse.json({ error: 'Échec de la création de l\'utilisateur' }, { status: 500 })
        }

        const newUserId = newAuthUser.user.id
        console.log('Auth user created successfully:', newUserId)

        // 2. Add to Admins table
        console.log('Adding user to admins table with role:', role)
        const { error: insertError } = await supabaseAdmin.from('admins').insert({
            id: newUserId,
            role: role || 'admin'
        })

        if (insertError) {
            console.error('Admins table insert error:', insertError)
            // Rollback auth user
            await supabaseAdmin.auth.admin.deleteUser(newUserId)
            return NextResponse.json({ 
                error: `Erreur lors de l'ajout dans la table admins: ${insertError.message}`,
                details: insertError 
            }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: newUserId })
    } catch (error: any) {
        console.error('Global admin creation error:', error)
        return NextResponse.json({ error: error.message || 'Une erreur inattendue est survenue' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const currentUserRole = adminData.role

    try {
        const { admin_id, role, username } = await request.json()

        if (admin_id === user.id && role) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
        }

        // Check target admin role
        const { data: targetAdmin } = await supabaseAdmin.from('admins').select('role').eq('id', admin_id).single()
        if (!targetAdmin) return NextResponse.json({ error: 'Target admin not found' }, { status: 404 })

        // Hierarchy check for editing
        if (currentUserRole === 'super_admin' && (targetAdmin.role === 'owner' || targetAdmin.role === 'super_admin')) {
            return NextResponse.json({ error: 'Forbidden: Super Admins cannot edit Owners or other Super Admins' }, { status: 403 })
        }
        
        if (currentUserRole === 'admin') {
             return NextResponse.json({ error: 'Forbidden: Admins cannot edit others' }, { status: 403 })
        }

        // Role update logic
        if (role) {
            if (currentUserRole !== 'owner' && (role === 'owner' || role === 'super_admin')) {
                return NextResponse.json({ error: 'Forbidden: Only Owners can assign Owner/Super Admin roles' }, { status: 403 })
            }
            
            const { error: updateError } = await supabaseAdmin
                .from('admins')
                .update({ role })
                .eq('id', admin_id)

            if (updateError) throw updateError
        }

        // Username update logic
        if (username) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ username })
                .eq('id', admin_id)
            if (profileError) throw profileError
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const currentUserRole = adminData.role

    try {
        const { searchParams } = new URL(request.url)
        const admin_id = searchParams.get('id')

        if (!admin_id) return NextResponse.json({ error: 'Missing admin_id' }, { status: 400 })
        if (admin_id === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

        // Check target admin role
        const { data: targetAdmin } = await supabaseAdmin.from('admins').select('role').eq('id', admin_id).single()
        if (!targetAdmin) return NextResponse.json({ error: 'Target admin not found' }, { status: 404 })

        // Hierarchy check for deletion
        if (currentUserRole === 'super_admin' && (targetAdmin.role === 'owner' || targetAdmin.role === 'super_admin')) {
            return NextResponse.json({ error: 'Forbidden: Super Admins can only delete standard Admins' }, { status: 403 })
        }

        if (currentUserRole === 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins cannot delete others' }, { status: 403 })
        }

        // Delete from admins first
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
