// src/app/admin/types/admin.d.ts
/**
 * Admin Type Declarations
 * Type definitions for the admin panel components and functionality.
 */


declare global {
  // NextAuth Session Extension
  namespace NextAuth {
    interface User {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      group: string;
    }

    interface Session {
      user: User & {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        group: string;
      };
    }
  }
}

// Product Types
export interface Product {
  _id: string;
  owner: string;
  name: string;
  quantity: number;
  price: number;
  createdBy: UserDetails;
  createdAt: Date;
  lastEditedBy?: UserDetails;
  lastEditedAt?: Date;
  notes?: ProductNote[];
}

export interface ProductNote {
  content: string;
  createdBy: UserDetails;
  createdAt: Date;
  updatedBy?: UserDetails;
  updatedAt?: Date;
  isNew: boolean;
  isUpdated: boolean;
}

// User Types
export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AdminUser extends UserDetails {
  username: string;
  email: string;
  group: 'admin';
}

// Statistics Types
export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  monthlyRevenue: number;
}

// Chart Types
export interface ChartData {
  revenueData: {
    labels: string[];
    values: number[];
  };
  inventoryData: {
    labels: string[];
    values: number[];
  };
}

// Operation History Types
export interface OperationHistoryItem {
  _id: string;
  type: 'create' | 'update' | 'delete';
  productId: string;
  productName: string;
  performedBy: UserDetails;
  timestamp: Date;
  details?: string;
}

// Notification Types
export interface NotificationItem {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
  createdBy?: UserDetails;
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
}

export interface AdminTableProps {
  products: Product[];
  onEdit: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: NextAuth.User | null;
}

export interface ChartProps {
  revenueData: {
    labels: string[];
    values: number[];
  };
  inventoryData: {
    labels: string[];
    values: number[];
  };
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, '_id' | 'createdAt' | 'createdBy' | 'lastEditedAt' | 'lastEditedBy'>) => Promise<void>;
  onCancel: () => void;
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
}

export interface SortOption {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] };
