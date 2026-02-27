import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { transaction_id, reason } = await request.json()
        const supabaseAdmin = createSupabaseServerClient()

        const { data: tx } = await supabaseAdmin
            .from('transactions')
            .select('buyer_id, amount, status')
            .eq('id', transaction_id)
            .single()

        if (!tx || !['escrow', 'paid'].includes(tx.status)) {
            return NextResponse.json({ error: "Transaction invalide pour remboursement" }, { status: 400 })
        }

        // 1. Refund to buyer: increment buyer's wallet (assuming platform uses internal wallet for refunds so they can reuse it or withdraw)
        // Or normally we'd issue a refund strictly to Bictorys card. 
        // Per instructions: "Pour créditer/débiter le portefeuille, utilise impérativement les Remote Procedure Calls"
        const { error: rpcError } = await supabaseAdmin.rpc('increment_wallet', {
            amount: tx.amount,
            user_id: tx.buyer_id
        })
        if (rpcError) throw rpcError

        // 2. Trace
        await supabaseAdmin.from('wallet_history').insert({
            user_id: tx.buyer_id,
            type: 'credit',
            amount: tx.amount,
            description: `Remboursement commande ${transaction_id.substring(0, 8)} ${reason ? ' - ' + reason : ''}`,
            status: 'completed'
        })

        // 3. Update transaction
        await supabaseAdmin.from('transactions')
            .update({ status: 'refunded' })
            .eq('id', transaction_id)

        // Notify buyer
        await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
            body: JSON.stringify({
                user_id: tx.buyer_id,
                title: "Remboursement émis 🔄",
                body: `Votre achat a été remboursé. ${tx.amount} XOF ont été ajoutés à votre portefeuille.`,
            })
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
