import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from '@/lib/auth/server';

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { name, email, phone, role, password } = (await request.json()) as {
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'driver' | 'staff';
    password: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName: name,
    phoneNumber: phone || undefined
  });

  await adminDb.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    name,
    email,
    phone: phone || '',
    role,
    active: true,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ uid: userRecord.uid });
}
