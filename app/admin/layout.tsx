import { requireAdmin } from '@/lib/auth/server';
import AuthGuard from '@/components/AuthGuard';
import TopNav from '@/components/TopNav';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <TopNav />
        <main className="px-6 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
