import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Initialize modern response context for Next.js 16 route engine
  let response = NextResponse.next({ request: { headers: req.headers } });

  // 2. Map standard Next.js 16 cookie lifecycle storage methods
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            // Regenerate response to pass cookies correctly through the Next.js 16 runtime layer
            response = NextResponse.next({ request: { headers: req.headers } });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // 3. Extract the active user metadata securely from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Define your public paths
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/q/');

  // 5. Handle Next.js 16 App Router API interceptor logic safely
  if (pathname.startsWith('/api/')) {
    const isPublicApi = pathname.startsWith('/api/webhooks');

    if (!user && !isPublicApi) {
      return NextResponse.json(
        { error: 'Unauthorized. Missing valid session token context.' },
        { status: 401 }
      );
    }
    return response;
  }

  // 6. Handle frontend page redirection rules safely
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/sign-in', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Next.js 16 optimized matcher configurations
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
