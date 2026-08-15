import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Mirrors OPEN_ADMIN in src/server/admin-access.ts.
 *
 * Middleware runs on the edge runtime and must not pull in the server module
 * graph, so the value is repeated here rather than imported. Both are turned off
 * by the same environment variable, which is the switch that actually matters in
 * a deployment — but if you flip the constant, flip this one too.
 */
const OPEN_ADMIN_DEFAULT = true;

/**
 * Edge gate for /admin.
 *
 * This refreshes the session cookie and bounces anonymous visitors to the login
 * page. It is a convenience layer, NOT the authorization boundary — every
 * mutation re-checks the role server-side, and Postgres RLS is what actually
 * enforces access. See supabase/migrations/0001_init.sql.
 */
export async function middleware(request: NextRequest) {
  // The admin is open: there is nothing to gate, and bouncing people to a login
  // screen they cannot use would be the worst of both. See
  // src/server/admin-access.ts for how to turn sign-in back on.
  if (process.env.ADMIN_REQUIRE_SIGN_IN?.trim() !== 'true' && OPEN_ADMIN_DEFAULT) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // With no backend configured, /admin renders its own "not configured" state.
  // A blank-but-defined variable counts as not configured — and a malformed URL
  // would make createServerClient throw on every single /admin request, so it is
  // validated here rather than trusted.
  if (!url || !anon) return NextResponse.next();
  try {
    new URL(url);
  } catch {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (entries: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        for (const { name, value } of entries) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of entries) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/admin/login';
    redirect.searchParams.set('next', pathname);
    return NextResponse.redirect(redirect);
  }

  if (user && pathname === '/admin/login') {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/admin';
    redirect.search = '';
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
