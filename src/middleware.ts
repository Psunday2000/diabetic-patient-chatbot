
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  const hasSession = !!sessionCookie;

  // If logged in and on auth pages, redirect to chat (Laravel-style RedirectIfAuthenticated)
  if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  // If not logged in and on protected routes, redirect to login
  if (!hasSession && ['/chat', '/profile'].some(path => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Allow all other routes (including root page for both logged-in and logged-out users)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup', 
    '/chat/:path*',
    '/profile/:path*'
  ],
};
