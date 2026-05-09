import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { payout_id, user_id, amount, provider = 'mobile_money', phone } = await request.json()
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

        // 1. Verify Request
        const { data: payout } = await supabaseAdmin
            .from('wallet_history')
            .select('status, amount')
            .eq('id', payout_id)
            .single()

        if (!payout || payout.status !== 'pending') {
            return NextResponse.json({ error: "Demande invalide ou déjà traitée" }, { status: 400 })
        }

        // 2. Real API call to Bictorys Payment Engine
        const bictorysRes = await fetch("https://api.test.bictorys.com/pay/v1/payouts", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.BICTORYS_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount * 100, // Bictorys generally expects the smallest currency unit
                currency: 'XOF',
                provider,
                phone,
                reference: `admin-payout-${payout_id}-${Date.now()}`
            })
        })

        if (!bictorysRes.ok) {
            const errorData = await bictorysRes.json().catch(() => ({}))
            console.error("Bictorys payout failed:", errorData)
            return NextResponse.json({ error: "Échec de l'initialisation du virement côté fournisseur (Bictorys)" }, { status: 500 })
        }

        console.log(`Bictorys Payout sent for ${amount} XOF to ${user_id} via ${provider}.`)

        // 3. Mark Debit as Completed (it was initially pending in wallet_history usually)

        const { error: rpcError } = await supabaseAdmin.rpc('decrement_wallet', { amount: payout.amount, user_id })
        if (rpcError) throw new Error("Echec decrement wallet après succès Bictorys. DÉSYNCHRONISATION POSSIBLE.")

        await supabaseAdmin.from('wallet_history').update({ status: 'completed' }).eq('id', payout_id)

        await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
            body: JSON.stringify({ user_id, title: "Demande de virement approuvée ✅", body: `Vos ${payout.amount} XOF sont en cours d'acheminement.` })
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
