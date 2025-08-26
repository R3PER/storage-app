// src/app/admin/adminApi.ts
/**
 * Admin API Functions
 * Provides API functions for admin panel operations.
 * Handles data fetching, error handling, and response parsing.
 */

import {
  ApiResponse,
  DashboardStats,
  NotificationItem,
  OperationHistoryItem,
  PaginatedResponse,
  Product
} from './types/admin';

const API_BASE = '/api/admin';

// Error handling helper
const handleApiError = (error: unknown) => {
  if (error instanceof Response) {
    throw new Error(`API Error: ${error.statusText}`);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('Unknown API error occurred');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw response;
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data.data as T;
  } catch (error) {
    handleApiError(error);
    throw error; // TypeScript needs this
  }
}

// Dashboard Stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return apiRequest<DashboardStats>('/stats');
};

// Products
export const fetchProducts = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<Product[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  return apiRequest<Product[]>(`/products?${params}`);
};

export const fetchProduct = async (id: string): Promise<Product> => {
  return apiRequest<Product>(`/products/${id}`);
};

export const createProduct = async (product: Omit<Product, '_id'>): Promise<Product> => {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  return apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
  });
};

// Operation History
export const fetchOperationHistory = async (
  page = 1,
  limit = 10
): Promise<PaginatedResponse<OperationHistoryItem>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  return apiRequest<PaginatedResponse<OperationHistoryItem>>(`/history?${params}`);
};

// Notifications
export const fetchNotifications = async (
  page = 1,
  limit = 10,
  unreadOnly = false
): Promise<PaginatedResponse<NotificationItem>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString(),
  });
  
  return apiRequest<PaginatedResponse<NotificationItem>>(`/notifications?${params}`);
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiRequest<void>(`/notifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true }),
  });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiRequest<void>('/notifications/mark-all-read', {
    method: 'PUT',
  });
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiRequest<void>(`/notifications/${id}`, {
    method: 'DELETE',
  });
};

export const clearAllNotifications = async (): Promise<void> => {
  await apiRequest<void>('/notifications/clear-all', {
    method: 'DELETE',
  });
};

// System Settings
export const fetchSystemSettings = async (): Promise<Record<string, any>> => {
  return apiRequest<Record<string, any>>('/settings');
};

export const updateSystemSettings = async (
  settings: Record<string, any>
): Promise<void> => {
  await apiRequest<void>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// User Management
export const fetchUsers = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<PaginatedResponse<any>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  return apiRequest<PaginatedResponse<any>>(`/users?${params}`);
};

// Export functions for reports
export const generateReport = async (
  type: 'inventory' | 'sales' | 'activity',
  options: Record<string, any> = {}
): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/reports/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error('Failed to generate report');
  }

  return response.blob();
};
