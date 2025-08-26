import {
  ApiError,
  checkAdminAuth,
  createApiResponse,
  handleApiError
} from '../../../../lib/api-utils';
import { connectDB } from '../../../../lib/mongodb';
import History from '../../../../models/History';

// GET /api/admin/history
export async function GET(request: Request) {
  try {
    console.log('GET /api/admin/history - Starting request');
    
    console.log('Checking admin authentication...');
    await checkAdminAuth();
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connection established');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const period = searchParams.get('period');
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    // Type filter
    if (type) {
      const validTypes = [
        'product_update', 'product_create', 'product_delete',
        'note_add', 'note_edit', 'note_delete',
        'user_update', 'user_create', 'user_delete', 'user_ban', 'user_role_change',
        'inventory_update', 'price_update'
      ];
      if (!validTypes.includes(type)) {
        throw new ApiError('Invalid operation type', 400);
      }
      query.type = type;
    }

    // Product filter
    if (productId) {
      query.productId = productId;
    }

    // User filter
    if (userId) {
      query.userId = userId;
    }

    // Text search
    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { userFirstName: { $regex: search, $options: 'i' } },
        { userLastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add date filter based on period
    if (period && period !== 'all') {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      query.timestamp = { $gte: startDate };
    }

    // Execute query with pagination
    const [history, total] = await Promise.all([
      History.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      History.countDocuments(query)
    ]);

    console.log('GET /api/admin/history - Query:', query);
    console.log(`Found ${history.length} history entries out of ${total} total`);

    const mappedHistory = history.map((entry: any) => {
      try {
        return {
          _id: entry._id.toString(),
          type: entry.type,
          productId: entry.productId?.toString(),
          productName: entry.productName,
          userId: entry.userId,
          userFirstName: entry.userFirstName,
          userLastName: entry.userLastName,
          details: entry.details,
          timestamp: entry.timestamp,
          noteId: entry.noteId?.toString(),
          metadata: entry.metadata || undefined
        };
      } catch (error) {
        console.error('Error mapping history entry:', error, entry);
        return null;
      }
    }).filter(Boolean);

    const response = {
      items: mappedHistory,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    console.log('Sending history response:', response);
    return createApiResponse(response);
  } catch (error) {
    console.error('Error in GET /api/admin/history:', error);
    if (error instanceof ApiError) {
      return handleApiError(error);
    }
    return handleApiError(new ApiError('Failed to fetch history', 500));
  }
}

// POST /api/admin/history
export async function POST(request: Request) {
  try {
    const session = await checkAdminAuth();
    await connectDB();
    
    const data = await request.json();
    const { type, productId, productName, details, noteId, metadata } = data;

    // Validate required fields
    if (!type || !details) {
      throw new ApiError('Missing required fields', 400);
    }

    // Validate operation type
    const validTypes = [
      'product_update', 'product_create', 'product_delete',
      'note_add', 'note_edit', 'note_delete',
      'user_update', 'user_create', 'user_delete', 'user_ban', 'user_role_change',
      'inventory_update', 'price_update'
    ];
    if (!validTypes.includes(type)) {
      throw new ApiError('Invalid operation type', 400);
    }

    const historyEntry = await History.create({
      type,
      productId,
      productName,
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details,
      noteId,
      timestamp: new Date(),
      metadata: metadata || undefined
    });

    return createApiResponse({
      message: 'History entry added successfully',
      historyEntry
    });
  } catch (error) {
    return handleApiError(error);
  }
}
