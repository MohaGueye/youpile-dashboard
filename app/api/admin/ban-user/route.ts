import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { user_id, ban } = await request.json()

        // Service Role Client to bypass RLS and update profile
        const supabaseAdmin = createSupabaseServerClient()

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ is_banned: ban })
            .eq('id', user_id)

        if (profileError) throw profileError

        if (ban) {
            // Suspension de la session (10 ans)
            await supabaseAdmin.auth.admin.updateUserById(user_id, {
                ban_duration: '87600h'
            })
        } else {
            // Levée de la suspension
            await supabaseAdmin.auth.admin.updateUserById(user_id, {
                ban_duration: 'none'
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
