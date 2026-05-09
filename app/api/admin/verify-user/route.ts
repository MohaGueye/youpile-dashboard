import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseAdminClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { user_id, verify } = await request.json()
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ is_verified: verify })
            .eq('id', user_id)

        if (profileError) throw profileError

        // Trigger edge function for push notification
        await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
                user_id,
                title: verify ? "Compte vérifié 🎉" : "Badge vérifié retiré",
                body: verify ? "Félicitations, votre compte est maintenant certifié." : "Votre badge de vérification a été révoqué par la modération.",
            })
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
