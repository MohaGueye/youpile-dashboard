import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/slugify'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const body = await request.json()
        const { name, parent_id, is_active } = body
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

        // get highest sort_order
        let query = supabaseAdmin.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
        if (parent_id) query = query.eq('parent_id', parent_id)
        else query = query.is('parent_id', null)
        
        const { data: maxSort } = await query
        const nextSort = (maxSort?.[0]?.sort_order || 0) + 1

        const { error } = await supabaseAdmin
            .from('categories')
            .insert({ 
                name, 
                slug: slugify(name),
                parent_id: parent_id || null, 
                is_active: is_active ?? true,
                sort_order: nextSort
            })

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/categories', 'page')
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const supabase = createSupabaseServerClient()
    const supabaseAdmin = createSupabaseAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const body = await request.json()
        const { id, name, is_active, sort_order } = body
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const updates: any = {}
        if (name !== undefined) {
            updates.name = name
            updates.slug = slugify(name)
        }
        if (is_active !== undefined) updates.is_active = is_active
        if (sort_order !== undefined) updates.sort_order = sort_order

        const { error } = await supabaseAdmin
            .from('categories')
            .update(updates)
            .eq('id', id)

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/categories', 'page')
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

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        // 1. Check for sub-categories
        const { count: subCatCount } = await supabaseAdmin
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', id)
        
        if (subCatCount && subCatCount > 0) {
            return NextResponse.json({ 
                error: "Impossible de supprimer cette catégorie car elle contient des sous-catégories." 
            }, { status: 400 })
        }

        // 2. Check for listings
        const { count: listingsCount } = await supabaseAdmin
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id)
        
        if (listingsCount && listingsCount > 0) {
            return NextResponse.json({ 
                error: `Cette catégorie est utilisée par ${listingsCount} annonce(s).` 
            }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/categories', 'page')
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
