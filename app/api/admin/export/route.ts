import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { unparse } from 'papaparse' // normally use this or raw string concatenation for csv

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    if (!table || !['users', 'transactions', 'disputes', 'listings'].includes(table)) {
        return new NextResponse('Invalid Table', { status: 400 })
    }

    try {
        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminData } = await supabaseAdmin.from('admins').select('role').eq('id', user.id).single()
        if (!adminData) return new NextResponse('Forbidden: Admins only', { status: 403 })

        // Simplistic export implementation
        let dataToExport = []

        if (table === 'users') {
            const { data } = await supabaseAdmin.from('profiles').select('*')
            dataToExport = data || []
        } else if (table === 'transactions') {
            const { data } = await supabaseAdmin.from('transactions').select('*')
            dataToExport = data || []
        } else if (table === 'disputes') {
            const { data } = await supabaseAdmin.from('disputes').select('*')
            dataToExport = data || []
        } else if (table === 'listings') {
            const { data } = await supabaseAdmin.from('listings').select('*')
            dataToExport = data || []
        }

        if (dataToExport.length === 0) return new NextResponse('No data', { status: 204 })

        // Generate CSV string securely using papaparse
        const csv = unparse(dataToExport)

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${table}_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 })
    }
}
