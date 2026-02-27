import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { unparse } from 'papaparse' // normally use this or raw string concatenation for csv

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    if (!table || !['users', 'transactions', 'disputes'].includes(table)) {
        return new NextResponse('Invalid Table', { status: 400 })
    }

    try {
        const supabaseAdmin = createSupabaseServerClient()

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
        }

        if (dataToExport.length === 0) return new NextResponse('No data', { status: 204 })

        // Generate CSV string manually
        const header = Object.keys(dataToExport[0]).join(',') + '\n'
        const csvRows = dataToExport.map((row: any) =>
            Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
        )
        const csv = header + csvRows.join('\n')

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
