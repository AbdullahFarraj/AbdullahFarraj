import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export type SessionUser = {
  uid: string;
  email: string | null;
  role: 'admin' | 'driver' | 'staff';
  name: string;
};

export async function getSessionUser() {
  const session = cookies().get('session')?.value;
  if (!session) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();

    if (!userSnap.exists) {
      return null;
    }

    const userData = userSnap.data() as SessionUser & { email: string | null };
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: userData.role,
      name: userData.name
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }
  return user;
}
