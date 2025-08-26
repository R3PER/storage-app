'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link href="/" className="text-xl font-bold">
          Magazyn
        </Link>
        <div className="flex items-center">
          {session ? (
            <div className="flex items-center space-x-4">
              <span>Witaj, {session.user?.firstName} {session.user?.lastName}</span>
              <Link
                href="/dashboard"
                className="text-white hover:text-gray-200"
              >
                Dashboard
              </Link>
              {session.user?.group === 'admin' && (
                <Link
                  href="/admin"
                  className="text-white hover:text-gray-200"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-white hover:text-gray-200"
              >
                Profil
              </Link>
              <button
                onClick={() => signOut()}
                className="ml-4 bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-opacity-90"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              Zaloguj
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
