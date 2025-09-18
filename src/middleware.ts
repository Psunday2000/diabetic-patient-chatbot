
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');

  const { pathname } = request.nextUrl;

  // If trying to access protected routes without a session, redirect to login
  if (['/chat', '/profile'].some(path => pathname.startsWith(path))) {
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // If there is a session and user tries to access auth pages, redirect to chat
  if (['/', '/login', '/signup'].includes(pathname)) {
    if (sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/chat';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
