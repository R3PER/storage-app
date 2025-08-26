import {
  ApiError,
  checkAdminAuth,
  createApiResponse,
  handleApiError
} from '../../../../lib/api-utils';
import { connectDB } from '../../../../lib/mongodb';
import History from '../../../../models/History';
import UserModel from '../../../../models/User';

// GET /api/admin/users
export async function GET(request: Request) {
  try {
    console.log('GET /api/admin/users - Starting request');
    
    console.log('Checking admin authentication...');
    await checkAdminAuth();
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connection established');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    
    console.log('Query parameters:', { page, limit, search });

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Update lastActive for online users
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await UserModel.updateMany(
      { lastActive: { $gt: fiveMinutesAgo } },
      { $set: { lastActive: new Date() } }
    );
    console.log('MongoDB query:', JSON.stringify(query));

    console.log('Fetching users from database...');
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);
    console.log(`Found ${users.length} users out of ${total} total`);

    const mappedUsers = users.map((user: any) => ({
      id: user._id?.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      group: user.group,
      active: user.active,
      approved: user.approved,
      approvedBy: user.approvedBy,
      approvedAt: user.approvedAt,
      createdAt: user.createdAt,
      isOnline: user.lastActive && user.lastActive > fiveMinutesAgo
    }));

    const response = {
      items: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
    
    console.log('Sending response with users data:', response);
    return createApiResponse(response);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return handleApiError(error);
  }
}

// POST /api/admin/users
export async function POST(request: Request) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const data = await request.json();
    const { firstName, lastName, email, group, active } = data;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new ApiError('Missing required fields', 400);
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new ApiError('Email already exists', 400);
    }

    // Create new user
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      group: group || 'user',
      active: true,
      approved: false, // New users need approval
      createdAt: new Date()
    });

    // Create history entry for user creation
    await History.create({
      type: 'user_update',
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Utworzono użytkownika ${firstName} ${lastName}`,
      timestamp: new Date()
    });

    return createApiResponse({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        group: user.group,
        active: user.active,
        createdAt: user.createdAt
      }
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
