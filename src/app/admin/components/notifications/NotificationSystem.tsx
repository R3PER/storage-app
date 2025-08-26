// src/app/admin/components/notifications/NotificationSystem.tsx
/**
 * NotificationSystem Component
 * Displays system notifications and alerts in the admin panel.
 * Shows low stock warnings, system updates, and user actions.
 */
"use client";

import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useState } from 'react';
import { BsBell, BsCheck, BsExclamationTriangle, BsInfo, BsX } from 'react-icons/bs';
import { useNotificationContext, useNotificationHandler } from '../../contexts/NotificationContext';
import { NotificationItem } from '../../types/admin';
import { LoadingSpinner } from '../common/Loading';

interface NotificationIconProps {
  type: NotificationItem['type'];
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className = "h-5 w-5" }) => {
  switch (type) {
    case 'warning':
      return <BsExclamationTriangle className={`${className} text-yellow-500`} />;
    case 'error':
      return <BsX className={`${className} text-red-500`} />;
    case 'success':
      return <BsCheck className={`${className} text-green-500`} />;
    default:
      return <BsInfo className={`${className} text-blue-500`} />;
  }
};

export const NotificationSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleNotificationClick = useNotificationHandler();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAllAsRead,
    refresh,
    clearNotifications,
    requestNotificationPermission,
    notificationPermission,
    isNotificationSupported
  } = useNotificationContext();

  const formatTimestamp = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: pl
    });
  };

  const handlePermissionRequest = async () => {
    if (isNotificationSupported && notificationPermission === 'default') {
      await requestNotificationPermission();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          handlePermissionRequest();
        }}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-label={`${unreadCount} nieprzeczytanych powiadomień`}
      >
        <BsBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Powiadomienia
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => refresh()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    Odśwież
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => clearNotifications()}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>
              {isNotificationSupported && notificationPermission === 'default' && (
                <button
                  onClick={handlePermissionRequest}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Włącz powiadomienia systemowe
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" text="Ładowanie powiadomień..." />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  <p className="mb-2">{error}</p>
                  <button
                    onClick={() => refresh()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0">
                        <NotificationIcon type={notification.type} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.data?.type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                            {notification.data.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Brak powiadomień
                </div>
              )}
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
