import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { name, parent_id, is_active } = await request.json()

        // get highest sort_order in same level
        let query = supabaseAdmin.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
        if (parent_id) {
            query = query.eq('parent_id', parent_id)
        } else {
            query = query.is('parent_id', null)
        }
        const { data: maxSort } = await query

        let nextSort = 1
        if (maxSort && maxSort.length > 0) {
            nextSort = maxSort[0].sort_order + 1
        }

        const { error } = await supabaseAdmin
            .from('categories')
            .insert({ name, parent_id: parent_id || null, is_active: is_active ?? true, sort_order: nextSort })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { id, name, is_active, sort_order } = await request.json()

        const updates: any = {}
        if (name !== undefined) updates.name = name
        if (is_active !== undefined) updates.is_active = is_active
        if (sort_order !== undefined) updates.sort_order = sort_order

        const { error } = await supabaseAdmin
            .from('categories')
            .update(updates)
            .eq('id', id)

        if (error) throw error

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
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
