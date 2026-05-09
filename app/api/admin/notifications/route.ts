import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData || !['owner', 'super_admin'].includes(adminData.role)) {
        return NextResponse.json({ error: 'Forbidden: Owner and Super Admins only' }, { status: 403 })
    }

    try {
        const { user_ids, title, body, type = 'system', target_all = false } = await request.json()

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
        }

        let recipientIds = user_ids || []

        // If target_all, get all user IDs
        if (target_all) {
            const { data: allUsers } = await supabaseAdmin
                .from('profiles')
                .select('id')
            recipientIds = allUsers?.map((u: any) => u.id) || []
        }

        if (recipientIds.length === 0) {
            return NextResponse.json({ error: 'No recipients specified' }, { status: 400 })
        }

        // Insert notifications
        const notifications = recipientIds.map((userId: string) => ({
            user_id: userId,
            type,
            title,
            body,
            is_read: false,
        }))

        const { error: insertError } = await supabaseAdmin
            .from('notifications')
            .insert(notifications)

        if (insertError) throw insertError

        return NextResponse.json({ 
            success: true, 
            count: recipientIds.length,
            message: `${recipientIds.length} notification(s) envoyée(s)`
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const { data: notifications, error: fetchError } = await supabaseAdmin
            .from('notifications')
            .select(`
                id,
                user_id,
                type,
                title,
                body,
                is_read,
                created_at,
                profiles:user_id(username, email)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (fetchError) throw fetchError

        // Get total count
        const { count, error: countError } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })

        if (countError) throw countError

        return NextResponse.json({
            notifications,
            total: count,
            limit,
            offset
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
