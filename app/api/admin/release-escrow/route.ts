import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const { transaction_id } = await request.json()
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })

        const { data: tx } = await supabaseAdmin
            .from('transactions')
            .select('seller_id, net_amount, status')
            .eq('id', transaction_id)
            .single()

        if (!tx || tx.status !== 'escrow') {
            return NextResponse.json({ error: "Transaction inexistant ou statut invalide" }, { status: 400 })
        }

        // 1. Release to seller: increment wallet
        const { error: rpcError } = await supabaseAdmin.rpc('increment_wallet', {
            amount: tx.net_amount,
            user_id: tx.seller_id
        })
        if (rpcError) throw rpcError

        // 2. Insert wallet history trace
        await supabaseAdmin.from('wallet_history').insert({
            user_id: tx.seller_id,
            type: 'credit',
            amount: tx.net_amount,
            description: `Fonds libérés pour la transaction ${transaction_id.substring(0, 8)}`,
            status: 'completed'
        })

        // 3. Update transaction status
        await supabaseAdmin.from('transactions')
            .update({ status: 'completed' })
            .eq('id', transaction_id)

        // Notify seller
        await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/send-push-notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
            body: JSON.stringify({
                user_id: tx.seller_id,
                title: "Fonds libérés 💰",
                body: `Votre solde a été crédité de ${tx.net_amount} XOF.`,
            })
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
