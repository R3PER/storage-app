import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profil użytkownika</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Nazwa użytkownika</h2>
            <p className="mt-1 text-gray-900">{session.user?.username}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Imię i nazwisko</h2>
            <p className="mt-1 text-gray-900">{session.user?.firstName} {session.user?.lastName}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Email</h2>
            <p className="mt-1 text-gray-900">{session.user?.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Grupa</h2>
            <p className="mt-1 text-gray-900">{session.user?.group}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
