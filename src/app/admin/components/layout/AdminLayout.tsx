// src/app/admin/components/layout/AdminLayout.tsx
"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { AdminLayoutProps } from '../../types/admin';
import { LoadingSpinner } from '../common/Loading';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const UnauthorizedError = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Brak dostępu
        </h2>
        <p className="text-gray-600 mb-6">
          Nie masz uprawnień do wyświetlenia panelu administratora.
          Skontaktuj się z administratorem systemu, jeśli uważasz, że to błąd.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Wróć do strony głównej
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Zaloguj się ponownie
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && session.user.group !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner 
          size="lg" 
          text="Ładowanie panelu administratora..." 
        />
      </div>
    );
  }

  if (!session?.user || session.user.group !== 'admin') {
    return <UnauthorizedError />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100"
          role="main"
          aria-label="Panel administratora"
        >
          <div className="container mx-auto px-6 py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

// HOC for wrapping pages with AdminLayout
export const withAdminLayout = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithAdminLayout(props: P) {
    return (
      <AdminLayout>
        <WrappedComponent {...props} />
      </AdminLayout>
    );
  };
};
