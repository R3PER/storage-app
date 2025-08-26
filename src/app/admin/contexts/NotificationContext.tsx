// src/app/admin/contexts/NotificationContext.tsx
/**
 * NotificationContext
 * Provides notification state and functions to the admin panel.
 * Handles notification management and real-time updates.
 */
"use client";

import React, { createContext, useCallback, useContext } from 'react';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { useNotificationPermission, useNotifications, useNotificationSound } from '../hooks/useNotifications';
import { NotificationItem } from '../types/admin';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  clearNotifications: (type?: string) => Promise<void>;
  playNotificationSound: () => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  isNotificationSupported: boolean;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  pollingInterval?: number;
  soundUrl?: string;
}

export function NotificationProvider({
  children,
  pollingInterval = 30000,
  soundUrl = '/notification.mp3'
}: NotificationProviderProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    clearNotifications
  } = useNotifications({
    pollingInterval,
    autoRefresh: true
  });

  const playNotificationSound = useNotificationSound(soundUrl);
  const { permission, requestPermission, isSupported } = useNotificationPermission();

  // Show system notification
  const showSystemNotification = useCallback((notification: NotificationItem) => {
    if (permission === 'granted') {
      const systemNotification = new Notification('Magazyn - Nowe powiadomienie', {
        body: notification.message,
        icon: '/logo.png',
        tag: notification._id,
        data: notification.data
      });

      systemNotification.onclick = () => {
        if (notification.link) {
          window.location.href = notification.link;
        }
        window.focus();
        systemNotification.close();
      };
    }
  }, [permission]);

  // Handle new notifications
  React.useEffect(() => {
    console.log('Checking for new notifications...', notifications);
    const unreadNotifications = notifications.filter(n => !n.read);
    console.log('Found unread notifications:', unreadNotifications.length);
    
    if (unreadNotifications.length > 0) {
      console.log('Playing notification sound and showing system notifications');
      playNotificationSound();
      unreadNotifications.forEach(notification => {
        console.log('Showing notification:', notification);
        showSystemNotification(notification);
      });
    }
  }, [notifications, playNotificationSound, showSystemNotification]);

  const value = React.useMemo(() => ({
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    clearNotifications,
    playNotificationSound,
    notificationPermission: permission,
    requestNotificationPermission: requestPermission,
    isNotificationSupported: isSupported
  }), [
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    clearNotifications,
    playNotificationSound,
    permission,
    requestPermission,
    isSupported
  ]);

  console.log('NotificationContext value:', value);

  return (
    <ErrorBoundary>
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
    </ErrorBoundary>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// HOC to wrap components with notification context
export function withNotifications<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithNotificationsComponent(props: P) {
    return (
      <NotificationProvider>
        <WrappedComponent {...props} />
      </NotificationProvider>
    );
  };
}

// Custom hook for handling notification clicks
export function useNotificationHandler() {
  const { markAsRead } = useNotificationContext();

  const handleNotificationClick = useCallback(async (
    notification: NotificationItem,
    onSuccess?: () => void
  ) => {
    try {
      await markAsRead(notification._id);
      
      if (notification.link) {
        window.location.href = notification.link;
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  }, [markAsRead]);

  return handleNotificationClick;
}

// Custom hook for notification badges
export function useNotificationBadge(type?: NotificationItem['type']) {
  const { notifications } = useNotificationContext();
  
  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => 
      !n.read && (type ? n.type === type : true)
    ).length;
  }, [notifications, type]);

  return {
    unreadCount,
    hasUnread: unreadCount > 0
  };
}
