import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { dispute_id, action, note } = await request.json()
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

        const { data: dispute } = await supabaseAdmin
            .from('disputes')
            .select('transaction_id, buyer_id, seller_id, status')
            .eq('id', dispute_id)
            .single()

        if (!dispute) return NextResponse.json({ error: "Litige introuvable" }, { status: 404 })

        const { data: tx } = await supabaseAdmin
            .from('transactions')
            .select('amount, net_amount, status')
            .eq('id', dispute.transaction_id)
            .single()

        if (!tx || tx.status !== 'disputed') {
            return NextResponse.json({ error: "Transaction introuvable ou n'est plus en litige" }, { status: 400 })
        }

        let resolvedStatus = ''

        if (action === 'buyer') {
            // Rembourser acheteur
            await supabaseAdmin.rpc('increment_wallet', { amount: tx.amount, user_id: dispute.buyer_id })
            await supabaseAdmin.from('wallet_history').insert({
                user_id: dispute.buyer_id, type: 'credit', amount: tx.amount, description: `Gain de cause litige ${dispute_id.substring(0, 8)} (Remboursement)`, status: 'completed'
            })
            await supabaseAdmin.from('transactions').update({ status: 'refunded' }).eq('id', dispute.transaction_id)
            resolvedStatus = 'resolved_buyer'

            await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
                body: JSON.stringify({ user_id: dispute.buyer_id, title: "Litige résolu en votre faveur", body: `Vous avez été remboursé de ${tx.amount} XOF.` })
            })

        } else if (action === 'seller') {
            // Payer vendeur
            await supabaseAdmin.rpc('increment_wallet', { amount: tx.net_amount, user_id: dispute.seller_id })
            await supabaseAdmin.from('wallet_history').insert({
                user_id: dispute.seller_id, type: 'credit', amount: tx.net_amount, description: `Gain de cause litige ${dispute_id.substring(0, 8)} (Paiement validé)`, status: 'completed'
            })
            await supabaseAdmin.from('transactions').update({ status: 'completed' }).eq('id', dispute.transaction_id)
            resolvedStatus = 'resolved_seller'

            await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
                body: JSON.stringify({ user_id: dispute.seller_id, title: "Litige résolu en votre faveur", body: `Fonds libérés. Vous avez reçu ${tx.net_amount} XOF.` })
            })
        }

        // Mettre à jour le litige
        await supabaseAdmin
            .from('disputes')
            .update({ status: resolvedStatus, resolution_note: note })
            .eq('id', dispute_id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
