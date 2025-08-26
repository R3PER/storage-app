 // src/app/admin/hooks/useNotifications.ts
/**
 * Notification Hooks
 * Provides hooks for managing notifications, sounds, and permissions.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { NotificationItem } from '../types/admin';

interface UseNotificationsOptions {
  pollingInterval?: number;
  autoRefresh?: boolean;
  limit?: number;
}

export function useNotifications({
  pollingInterval = 60000, // Increased to 1 minute
  autoRefresh = true,
  limit = 50
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchNotificationsData = useCallback(async () => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching notifications...');
      }
      setError(null);
      const response = await fetch(`/api/admin/notifications?page=1&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const { data } = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Notifications data received:', data);
      }
      
      const items = data?.items || [];
      const unread = items.filter((n: NotificationItem) => !n.read).length || 0;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Found ${items.length} notifications, ${unread} unread`);
      }
      
      setNotifications(items);
      setUnreadCount(unread);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('Error fetching notifications:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const startPolling = useCallback(() => {
    if (!autoRefresh) return;

    const poll = () => {
      pollingTimeoutRef.current = setTimeout(async () => {
        await fetchNotificationsData();
        poll();
      }, pollingInterval);
    };

    poll();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [autoRefresh, pollingInterval, fetchNotificationsData]);

  useEffect(() => {
    fetchNotificationsData();
    const cleanup = startPolling();
    
    return () => {
      cleanup?.();
    };
  }, [fetchNotificationsData, startPolling]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Marking notification as read:', id);
      }
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      const { data } = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Mark as read response:', data);
      }
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      console.error('Error marking notification as read:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      try {
        const response = await fetch('/api/admin/notifications/mark-all-read', {
          method: 'PUT',
        });
        if (!response.ok) {
          throw new Error('Failed to mark all notifications as read');
        }
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      } catch (err) {
        console.error('Error marking all notifications as read:', err);
        // Don't throw error, just show it in the UI
        setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      try {
        const response = await fetch('/api/admin/notifications/clear-all', {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to clear notifications');
        }
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error('Error clearing notifications:', err);
        // Don't throw error, just show it in the UI
        setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotificationsData();
  }, [fetchNotificationsData]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refresh
  };
}

export function useNotificationSound(soundUrl = '/notification.mp3') {
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(soundUrl);
    }
  }, [soundUrl]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  return play;
}

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied' as NotificationPermission;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied' as NotificationPermission;
    }
  }, [isSupported]);

  return {
    permission,
    requestPermission,
    isSupported
  };
}
