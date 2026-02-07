import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Internal Task Hub',
  description: 'Internal company task management PWA',
  manifest: '/manifest.json',
  themeColor: '#1d4ed8',
  icons: {
    icon: '/icons/icon.svg'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
