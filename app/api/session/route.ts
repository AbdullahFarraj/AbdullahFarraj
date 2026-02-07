import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token: string };

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

  const response = NextResponse.json({ status: 'ok' });
  response.cookies.set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn / 1000,
    path: '/'
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'signed out' });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
