'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50"
    >
      Wyloguj
    </button>
  );
}