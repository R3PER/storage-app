// src/app/admin/types/admin.ts
/**
 * Admin Types
 * Type definitions for the admin panel components and functionality.
 */

import { Session } from 'next-auth';

// User Types
export interface ExtendedUser {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  group: string;
  active: boolean;
  approved: boolean;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: Date;
  isOnline?: boolean;
  createdAt: Date;
}

export interface User extends ExtendedUser {
  group: 'admin' | 'user';
}

export interface CustomSession extends Omit<Session, 'user'> {
  user: ExtendedUser;
}

// Product Types
export interface Product {
  _id: string;
  owner: string;
  name: string;
  quantity: number;
  price: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  lastEditedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastEditedAt?: Date;
  notes?: ProductNote[];
}

export interface ProductNote {
  content: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  updatedAt?: Date;
  isNew: boolean;
  isUpdated: boolean;
}

// Statistics Types
export interface BasicStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  recentUpdates: number;
  averagePrice: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface DashboardStats {
  basicStats: BasicStats;
  trends: {
    revenue: ChartData;
    inventory: ChartData;
  };
  lastUpdated: string;
}

// Operation History Types
export interface OperationHistoryItem {
  _id: string;
  type: 'product_update' | 'product_create' | 'product_delete' | 
        'note_add' | 'note_edit' | 'note_delete' |
        'user_update' | 'user_create' | 'user_delete' | 'user_ban' | 'user_role_change' |
        'inventory_update' | 'price_update';
  productId?: string;
  productName?: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  details: string;
  metadata?: {
    previousValue?: string | number;
    newValue?: string | number;
    reason?: string;
    affectedFields?: string[];
    [key: string]: any;
  };
  timestamp: Date;
  noteId?: string;
}

// Notification Types
export interface NotificationItem {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: {
    productId?: string;
    type?: string;
    currentQuantity?: number;
    updatedBy?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdBy?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    [key: string]: any;
  };
}

// Component Props Types
export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export interface AdminTableProps {
  products: Product[];
  onEdit: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: ExtendedUser | null;
  loading?: boolean;
}

export interface ChartProps {
  revenueData: ChartData;
  inventoryData: ChartData;
  loading?: boolean;
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, '_id' | 'createdAt' | 'createdBy' | 'lastEditedAt' | 'lastEditedBy'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Sort Types
export interface ProductFilter {
  search?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sortField?: keyof Product;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SortOption {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
