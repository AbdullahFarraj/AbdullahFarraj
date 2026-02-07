'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/tasks', label: 'Tasks' },
  { href: '/admin', label: 'Admin' },
  { href: '/profile', label: 'Profile' }
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="font-semibold text-slate-800">Internal Task Hub</div>
      <div className="flex gap-4 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 ${
              pathname?.startsWith(link.href) ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
