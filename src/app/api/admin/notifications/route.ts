import { startOfDay, subDays } from 'date-fns';
import {
  ApiError,
  checkAdminAuth,
  createApiResponse,
  handleApiError
} from '../../../../lib/api-utils';
import { connectDB } from '../../../../lib/mongodb';
import History, { IHistory } from '../../../../models/History';
import ProductModel from '../../../../models/Product';

interface SystemNotification {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: any;
}

// Helper function to generate low stock notifications
async function generateLowStockNotifications(): Promise<SystemNotification[]> {
  const lowStockProducts = await ProductModel.find({ quantity: { $lt: 10 } })
    .select('name quantity')
    .lean();

  return lowStockProducts.map(product => ({
    _id: `low_stock_${product._id}`,
    type: 'warning' as const,
    message: `Niski stan magazynowy: ${product.name} (${product.quantity} szt.)`,
    timestamp: new Date(),
    read: false,
    link: `/admin/products/${product._id}`,
    data: {
      productId: product._id,
      currentQuantity: product.quantity
    }
  }));
}

// Helper function to generate recent update notifications
async function generateRecentUpdateNotifications(): Promise<SystemNotification[]> {
  const recentUpdates = await ProductModel.find({
    lastEditedAt: { 
      $gte: startOfDay(subDays(new Date(), 1)) // Last 24 hours
    },
    lastEditedBy: { $exists: true }
  })
  .select('name lastEditedBy lastEditedAt')
  .lean();

  return recentUpdates
    .filter(product => product.lastEditedBy && product.lastEditedAt)
    .map(product => ({
      _id: `update_${product._id}`,
      type: 'info' as const,
      message: `${product.lastEditedBy.firstName} ${product.lastEditedBy.lastName} zaktualizował(a) produkt "${product.name}"`,
      timestamp: product.lastEditedAt,
      read: false,
      link: `/admin/products/${product._id}`,
      data: {
        productId: product._id,
        updatedBy: product.lastEditedBy
      }
    }));
}

// Helper function to generate recent history notifications
async function generateHistoryNotifications(): Promise<SystemNotification[]> {
  const recentHistory = await History.find({
    timestamp: { $gte: startOfDay(subDays(new Date(), 1)) }
  })
  .sort({ timestamp: -1 })
  .lean() as IHistory[];

  return recentHistory.map((item: IHistory) => {
    let message = '';
    let link = '';
    
    switch (item.type) {
      case 'product_create':
      case 'product_update':
      case 'note_add':
        link = `/admin/products/${item.productId}`;
        break;
      case 'user_update':
        link = `/admin/users`;
        break;
    }

    return {
      _id: `history_${item._id}`,
      type: 'info' as const,
      message: item.details,
      timestamp: item.timestamp,
      read: false,
      link,
      data: {
        type: item.type,
        userId: item.userId,
        productId: item.productId,
        noteId: item.noteId
      }
    };
  });
}

// GET /api/admin/notifications
export async function GET(request: Request) {
  try {
    await checkAdminAuth();
    await connectDB();

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as SystemNotification['type'] | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Generate all notifications
    const [lowStockNotifications, recentUpdateNotifications, historyNotifications] = await Promise.all([
      generateLowStockNotifications(),
      generateRecentUpdateNotifications(),
      generateHistoryNotifications()
    ]);

    let notifications = [
      ...lowStockNotifications,
      ...recentUpdateNotifications,
      ...historyNotifications
    ];

    // Apply filters
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by timestamp (newest first) and apply limit
    notifications.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );

    if (limit) {
      notifications = notifications.slice(0, limit);
    }

    return createApiResponse({
      items: notifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    return createApiResponse({ 
      message: 'Notification status updated successfully',
      id: params.id,
      read
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/notifications
export async function POST(request: Request) {
  try {
    const session = await checkAdminAuth();
    const data = await request.json();
    const { type, message, link } = data;

    if (!type || !message) {
      throw new ApiError('Missing required fields', 400);
    }

    if (!['info', 'warning', 'error', 'success'].includes(type)) {
      throw new ApiError('Invalid notification type', 400);
    }

    const notification: SystemNotification = {
      _id: `manual_${Date.now()}`,
      type: type as SystemNotification['type'],
      message,
      timestamp: new Date(),
      read: false,
      link,
      data: {
        createdBy: {
          id: session.user.id,
          firstName: session.user.firstName,
          lastName: session.user.lastName
        }
      }
    };

    return createApiResponse({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/notifications
export async function DELETE(request: Request) {
  try {
    await checkAdminAuth();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SystemNotification['type'] | null;
    const olderThan = searchParams.get('olderThan');

    return createApiResponse({
      message: 'Notifications cleared successfully',
      filters: {
        type,
        olderThan
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
