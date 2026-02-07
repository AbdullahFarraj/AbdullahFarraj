import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/admin', '/tasks', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get('session');

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/tasks/:path*', '/profile', '/login']
};
