import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let { data: { user } } = await supabase.auth.getUser()

    // Fallback: If no user but cookie exists, try to manually set session
    if (!user) {
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1]
        const legacyCookieName = `sb-${projectRef}-auth-token`
        const authCookie = request.cookies.get(legacyCookieName)

        if (authCookie) {
            try {
                const sessionData = JSON.parse(authCookie.value)
                const { data: { user: recoveredUser } } = await supabase.auth.setSession({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token
                })
                if (recoveredUser) {
                    user = recoveredUser
                }
            } catch (e) {
                // Ignore
            }
        }
    }

    const isAuthPage = request.nextUrl.pathname.startsWith('/login')

    if (!isAuthPage) {
        if (!user) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Verify admin status
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() { },
                },
            }
        )

        const { data: adminData } = await supabaseAdmin
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single()

        if (!adminData) {
            if (request.nextUrl.pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('error', 'Accès refusé. Réservé aux administrateurs.')
            return NextResponse.redirect(url)
        }
    }

    if (isAuthPage && user) {
        // Double check admin before redirecting away from login
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() { },
                },
            }
        )
        const { data: adminData } = await supabaseAdmin
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single()

        if (adminData) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
