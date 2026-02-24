import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {signToken, verifyToken} from '@/lib/auth/session';
import { isLandingOnlyMode } from '@/lib/config/runtime';

const protectedRoutes: string = '/dashboard';
const landingAllowedRoutes = ['/', '/impressum', '/datenschutz', '/ueber-uns', '/kontakt', '/sign-in', '/sign-up'];
const landingAllowedRoutePrefixes = ['/app'];

export async function proxy(request: NextRequest) {

  const {pathname} = request.nextUrl;
  const landingOnly = isLandingOnlyMode();

  if (landingOnly) {
    const isAllowedRoute =
      landingAllowedRoutes.includes(pathname) ||
      landingAllowedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    const isStaticAsset = pathname.includes('.');
    if (!isAllowedRoute && !isStaticAsset) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};


