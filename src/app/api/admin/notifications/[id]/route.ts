// src/app/api/admin/notifications/[id]/route.ts
/**
 * Admin Notification Update API Route
 * Handles updating individual notification statuses.
 */

import {
    ApiError,
    checkAdminAuth,
    createApiResponse,
    handleApiError
} from '@/lib/api-utils';

// PUT /api/admin/notifications/{id}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth();
    const data = await request.json();
    const { read } = data;

    if (typeof read !== 'boolean') {
      throw new ApiError('Invalid request data', 400);
    }

    // Extract notification type from ID prefix
    const [type] = params.id.split('_');

    // Return appropriate response based on notification type
    switch (type) {
      case 'low':
        return createApiResponse({
          message: 'Low stock notification status updated',
          id: params.id,
          read,
          type: 'warning'
        });

      case 'update':
        return createApiResponse({
          message: 'Update notification status updated',
          id: params.id,
          read,
          type: 'info'
        });

      case 'manual':
        return createApiResponse({
          message: 'Manual notification status updated',
          id: params.id,
          read,
          type: 'info'
        });

      default:
        throw new ApiError('Invalid notification ID', 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/notifications/{id}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth();

    // In a real application, you would delete the notification from the database
    // For now, we'll just return a success response
    return createApiResponse({
      message: 'Notification deleted successfully',
      id: params.id
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/admin/notifications/{id}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth();

    // Extract notification type and target from ID
    const [type, target] = params.id.split('_');

    // Return appropriate notification data based on type
    switch (type) {
      case 'low':
        return createApiResponse({
          _id: params.id,
          type: 'warning',
          message: 'Low stock notification',
          timestamp: new Date(),
          read: false,
          data: {
            productId: target,
            type: 'low_stock'
          }
        });

      case 'update':
        return createApiResponse({
          _id: params.id,
          type: 'info',
          message: 'Update notification',
          timestamp: new Date(),
          read: false,
          data: {
            productId: target,
            type: 'product_update'
          }
        });

      case 'manual':
        return createApiResponse({
          _id: params.id,
          type: 'info',
          message: 'Manual notification',
          timestamp: new Date(),
          read: false,
          data: {
            type: 'manual'
          }
        });

      default:
        throw new ApiError('Invalid notification ID', 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/notifications/{id}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth();
    const data = await request.json();

    // Validate update data
    if (!data || typeof data !== 'object') {
      throw new ApiError('Invalid update data', 400);
    }

    // In a real application, you would update the notification in the database
    // For now, we'll just return a success response
    return createApiResponse({
      message: 'Notification updated successfully',
      id: params.id,
      updates: data
    });
  } catch (error) {
    return handleApiError(error);
  }
}
