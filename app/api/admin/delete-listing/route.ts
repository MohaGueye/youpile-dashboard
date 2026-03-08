import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { listing_id, reason } = await request.json()
        const supabaseAdmin = createSupabaseAdminClient() // service role
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

        // 1. Mark listing as deleted
        const { error: updateError } = await supabaseAdmin
            .from('listings')
            .update({ status: 'deleted' })
            .eq('id', listing_id)

        if (updateError) throw updateError

        // 2. Resolve related reports
        await supabaseAdmin
            .from('reports')
            .update({ status: 'resolved' })
            .eq('target_id', listing_id)
            .eq('target_type', 'listing')

        // 3. Get seller id to notify
        const { data: listingData } = await supabaseAdmin
            .from('listings')
            .select('seller_id, title')
            .eq('id', listing_id)
            .single()

        if (listingData?.seller_id) {
            await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({
                    user_id: listingData.seller_id,
                    title: "Annonce supprimée ⚠️",
                    body: `Votre annonce "${listingData.title}" a été supprimée par la modération. Motif: ${reason || 'Violation des règles'}`,
                })
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
