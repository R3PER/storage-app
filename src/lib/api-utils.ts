// src/lib/api-utils.ts
/**
 * API Utilities
 * Common utilities for API routes including error handling and response formatting.
 */

import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        success: false,
        message: error.message,
        data: error.data 
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { 
      success: false,
      message: 'Unknown error occurred' 
    },
    { status: 500 }
  );
}

export function createApiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  );
}

export async function checkAdminAuth(): Promise<Session> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new ApiError('Unauthorized', 401);
  }

  if (session.user.group !== 'admin') {
    throw new ApiError('Forbidden: Admin access required', 403);
  }

  return session;
}

export function validateRequestData<T>(
  data: unknown,
  validator: (data: any) => data is T
): T {
  if (!validator(data)) {
    throw new ApiError('Invalid request data', 400);
  }
  return data;
}

// Type guards for request validation
export const isProduct = (data: any): boolean => {
  const baseValidation = (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.price === 'number' &&
    data.name.trim() !== '' &&
    data.quantity >= 0 &&
    data.price >= 0
  );

  if (!baseValidation) return false;

  // Optional fields validation
  if ('owner' in data && typeof data.owner !== 'string') return false;
  
  if ('notes' in data && Array.isArray(data.notes)) {
    for (const note of data.notes) {
      if (
        typeof note !== 'object' ||
        note === null ||
        typeof note.content !== 'string' ||
        !note.createdBy ||
        typeof note.createdBy.id !== 'string' ||
        typeof note.createdBy.firstName !== 'string' ||
        typeof note.createdBy.lastName !== 'string'
      ) {
        return false;
      }
    }
  }

  return true;
};

export const isPaginationParams = (data: any): data is {
  page?: number;
  limit?: number;
} => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if ('page' in data && (typeof data.page !== 'number' || data.page < 1)) {
    return false;
  }

  if ('limit' in data && (typeof data.limit !== 'number' || data.limit < 1)) {
    return false;
  }

  return true;
};

export const isSortParams = (data: any): data is {
  field: string;
  order: 'asc' | 'desc';
} => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.field === 'string' &&
    (data.order === 'asc' || data.order === 'desc')
  );
};

export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
  return { page, limit, skip: (page - 1) * limit };
}

export function parseSortParams(searchParams: URLSearchParams) {
  const field = searchParams.get('sortField') || 'createdAt';
  const order = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  return { field, order };
}

export function parseFilterParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get('search') || undefined,
    minQuantity: parseInt(searchParams.get('minQuantity') || '0'),
    maxQuantity: parseInt(searchParams.get('maxQuantity') || '999999'),
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '999999')
  };
}
