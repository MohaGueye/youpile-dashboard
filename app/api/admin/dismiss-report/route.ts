import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createSupabaseAdminClient()

    const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
    if (!adminData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { report_id } = await request.json()

        const { error } = await supabaseAdmin
            .from('reports')
            .update({ status: 'dismissed' })
            .eq('id', report_id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
