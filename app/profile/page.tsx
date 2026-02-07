'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch('/api/session', { method: 'DELETE' });
    router.replace('/login');
  };

  if (loading || !profile) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="max-w-xl space-y-6 rounded-lg bg-white p-6 shadow">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-500">Manage your account details.</p>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Name:</span> {profile.name}</p>
        <p><span className="font-medium">Email:</span> {profile.email}</p>
        <p><span className="font-medium">Phone:</span> {profile.phone}</p>
        <p><span className="font-medium">Role:</span> {profile.role}</p>
      </div>
      <button className="bg-slate-900 text-white" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
