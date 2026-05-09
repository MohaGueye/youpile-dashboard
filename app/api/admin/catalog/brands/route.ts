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
        const { name, logo_url, is_active } = body

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('brands')
            .insert({ 
                name, 
                slug: slugify(name),
                logo_url: logo_url || null, 
                is_active: is_active ?? true 
            })

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/brands', 'page')
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
        const { id, name, logo_url, is_active } = body

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const updates: any = {}
        if (name !== undefined) {
            updates.name = name
            updates.slug = slugify(name)
        }
        if (logo_url !== undefined) updates.logo_url = logo_url
        if (is_active !== undefined) updates.is_active = is_active

        const { error } = await supabaseAdmin
            .from('brands')
            .update(updates)
            .eq('id', id)

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/brands', 'page')
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

        // Check for listings
        const { count: listingsCount } = await supabaseAdmin
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', id)
        
        if (listingsCount && listingsCount > 0) {
            return NextResponse.json({ 
                error: `Cette marque est utilisée par ${listingsCount} annonce(s).` 
            }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('brands')
            .delete()
            .eq('id', id)

        if (error) throw error
        
        revalidatePath('/(dashboard)/catalog/brands', 'page')
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
