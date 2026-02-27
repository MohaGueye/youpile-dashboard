import { createSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DisputeDetail } from "@/components/disputes/DisputeDetail"

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServerClient()

    const { data: dispute } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!dispute) return notFound()

    const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', dispute.transaction_id)
        .single()

    return <DisputeDetail dispute={dispute} transaction={transaction} />
}
