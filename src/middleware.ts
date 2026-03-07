import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete(name)
        },
      },
    }
  )

  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('/store') || url.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (url.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('adm')
      .eq('id', user!.id)
      .maybeSingle()

    if (!profile || profile.adm !== true) {
      return NextResponse.redirect(new URL('/store', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/store/:path*'],
}