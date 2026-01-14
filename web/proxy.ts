import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const guestOnlyRoutes = ['/sign-in', '/sign-up'];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has('accessToken');

  // Redirect authenticated users away from guest-only pages
  if (guestOnlyRoutes.some((route) => pathname.startsWith(route)) && hasAccessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up'],
};
