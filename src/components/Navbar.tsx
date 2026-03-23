'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tickets', label: 'Tickets' },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="font-bold text-indigo-600 text-lg">Lumen</Link>
        <div className="flex gap-4 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${pathname.startsWith(link.href) ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700">Sign out</button>
        </div>
      </div>
    </nav>
  );
}
