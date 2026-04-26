import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // The ONLY job of middleware is to refresh the Supabase session token.
  // Route protection is handled in each page/layout as a Server Component.
  // This avoids the cookie-timing bug where middleware can't see a session
  // that was just set by a server action one millisecond ago.

  let response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session — this updates the cookie if it's about to expire.
    // We intentionally ignore the result here; route protection is in layouts.
    await supabase.auth.getUser()
  } catch {
    // If Supabase is unreachable, just continue — don't block the request
  }

  return response
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next internals
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$).*)',
  ],
}
