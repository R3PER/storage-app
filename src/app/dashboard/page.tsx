import InventoryTable from '@/components/InventoryTable';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Witaj, {session.user?.firstName}
        </h1>
        <p className="text-gray-600">
          Panel zarządzania magazynem
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}