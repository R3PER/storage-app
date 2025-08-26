"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BsGear } from 'react-icons/bs';
import { LoadingSpinner } from '../common/Loading';
import { NotificationSystem } from '../notifications/NotificationSystem';
import { SettingsModal } from '../settings/SettingsModal';

export const AdminHeader: React.FC = () => {
  const { data: session, status } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (status === 'loading') {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Panel Administratora
            </h2>
            <div className="flex items-center space-x-4">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Panel Administratora
          </h2>

          <div className="flex items-center space-x-6">
            {/* Settings and Notifications */}
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-full hover:bg-gray-100"
                aria-label="Ustawienia"
              >
                <BsGear className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {session.user.firstName} {session.user.lastName}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                <span className="text-sm font-medium">
                  {session.user.firstName[0]}{session.user.lastName[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </header>
  );
};
