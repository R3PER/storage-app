'use client';

import { useSession } from 'next-auth/react';

export default function UserInfo() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <span className="text-white">
      Witaj, {session.user.firstName} {session.user.lastName}
    </span>
  );
}