'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Magazyn
        </Link>
        <div className="flex items-center space-x-6">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className={`hover:text-indigo-200 ${pathname === '/dashboard' ? 'underline' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`hover:text-indigo-200 ${pathname === '/profile' ? 'underline' : ''}`}
              >
                Profil
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`hover:text-indigo-200 ${pathname === '/login' ? 'underline' : ''}`}
              >
                Zaloguj
              </Link>
              <Link
                href="/register"
                className={`hover:text-indigo-200 ${pathname === '/register' ? 'underline' : ''}`}
              >
                Zarejestruj
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
