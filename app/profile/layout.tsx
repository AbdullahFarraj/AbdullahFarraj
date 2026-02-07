import AuthGuard from '@/components/AuthGuard';
import TopNav from '@/components/TopNav';

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <TopNav />
        <main className="px-6 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
