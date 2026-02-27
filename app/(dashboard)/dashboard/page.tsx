import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Users, ShoppingBag, CreditCard, DollarSign, AlertTriangle, UserCheck } from "lucide-react"
import { KPICard } from "@/components/dashboard/KPICard"
import { RegistrationsChart } from "@/components/dashboard/RegistrationsChart"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { AlertBanner } from "@/components/dashboard/AlertBanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, subDays, startOfDay } from "date-fns"

export default async function DashboardPage() {
    const supabase = createSupabaseServerClient()
    const today = startOfDay(new Date()).toISOString()

    // KPIs
    const [
        { count: totalUsers },
        { count: activeToday },
        { count: activeListings },
        { count: transactionsToday },
        { data: dailyRevenueData },
        { count: openDisputes },
        { data: disputesData },
        { count: pendingReports },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', today),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('transactions').select('fees').in('status', ['escrow', 'completed']).gte('created_at', today),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_review']),
        supabase.from('disputes').select('created_at').in('status', ['open', 'in_review']),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    const dailyRevenue = dailyRevenueData?.reduce((acc, curr) => acc + (curr.fees || 0), 0) || 0

    // 48h old disputes
    const twoDaysAgo = subDays(new Date(), 2)
    const urgentDisputesCount = disputesData?.filter(d => new Date(d.created_at) < twoDaysAgo).length || 0

    // Real data for charts
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
    const sevenDaysAgo = subDays(new Date(), 7).toISOString()

    const [
        { data: revenueData },
        { data: registrationData }
    ] = await Promise.all([
        supabase.from('sales_summary').select('day, total_fees').gte('day', thirtyDaysAgo).order('day', { ascending: true }),
        supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo)
    ])

    // Format revenue data
    const revenueChartData = (revenueData || []).map(d => ({
        date: format(new Date(d.day), 'dd/MM'),
        amount: d.total_fees || 0
    }))

    // Format registration data
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'dd/MM'))
    const regCounts: Record<string, number> = {}
    registrationData?.forEach(p => {
        const d = format(new Date(p.created_at), 'dd/MM')
        regCounts[d] = (regCounts[d] || 0) + 1
    })
    const registrationChartData = last7Days.map(date => ({
        date,
        count: regCounts[date] || 0
    }))

    let { data: { user } } = await supabase.auth.getUser()

    // Manual Recovery fallback for page components
    if (!user) {
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1]
        const authCookie = (await import('next/headers')).cookies().get(`sb-${projectRef}-auth-token`)
        if (authCookie) {
            try {
                const sessionData = JSON.parse(authCookie.value)
                const { data: recovered } = await supabase.auth.setSession({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token
                })
                user = recovered.user
            } catch (e) { }
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Vue d'ensemble</h1>

            <AlertBanner
                urgentDisputesCount={urgentDisputesCount}
                pendingReportsCount={pendingReports || 0}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <KPICard title="Utilisateurs Totaux" value={totalUsers || 0} icon={Users} />
                <KPICard title="Actifs aujourd'hui" value={activeToday || 0} icon={UserCheck} />
                <KPICard title="Annonces Actives" value={activeListings || 0} icon={ShoppingBag} />
                <KPICard title="Transactions (Auj.)" value={transactionsToday || 0} icon={CreditCard} />
                <KPICard title="Revenus (Auj.)" value={`${dailyRevenue.toLocaleString('fr-FR')} XOF`} icon={DollarSign} />
                <KPICard title="Litiges à traiter" value={openDisputes || 0} icon={AlertTriangle} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Évolution des Revenus (30 jours)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={revenueChartData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Nouvelles Inscriptions (7 jours)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RegistrationsChart data={registrationChartData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
