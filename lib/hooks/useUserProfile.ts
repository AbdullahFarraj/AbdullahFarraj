'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/client';

type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'driver' | 'staff';
  active: boolean;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const snapshot = await getDoc(doc(db, 'users', user.uid));
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { profile, loading };
}
