import {
    ApiError,
    checkAdminAuth,
    createApiResponse,
    handleApiError
} from '../../../../../lib/api-utils';
import { connectDB } from '../../../../../lib/mongodb';
import History from '../../../../../models/History';
import UserModel from '../../../../../models/User';

// PUT /api/admin/users/{id}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const data = await request.json();
    const { active, approved, group, firstName, lastName, email } = data;

    const user = await UserModel.findById(params.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Store old values for history
    const oldValues = {
      active: user.active,
      approved: user.approved,
      group: user.group,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // Handle approval
    if (typeof approved === 'boolean' && approved !== user.approved) {
      user.approved = approved;
      if (approved) {
        user.approvedBy = {
          id: session.user.id,
          firstName: session.user.firstName,
          lastName: session.user.lastName
        };
        user.approvedAt = new Date();
      } else {
        user.approvedBy = undefined;
        user.approvedAt = undefined;
      }
    }

    // Update user fields
    if (typeof active === 'boolean') {
      user.active = active;
      if (!active) {
        // Clear lastActive when deactivating user
        user.lastActive = undefined;
      }
    }
    if (group) user.group = group;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await UserModel.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        throw new ApiError('Email already exists', 400);
      }
      user.email = email;
    }

    await user.save();

    // Create history entries
    const changes = [];
    if (oldValues.active !== user.active) {
      changes.push(`status: ${oldValues.active ? 'aktywny' : 'nieaktywny'} → ${user.active ? 'aktywny' : 'nieaktywny'}`);
    }
    if (oldValues.approved !== user.approved) {
      await History.create({
        type: user.approved ? 'user_update' : 'user_ban',
        userId: session.user.id,
        userFirstName: session.user.firstName,
        userLastName: session.user.lastName,
        details: user.approved 
          ? `Zatwierdzono konto użytkownika ${user.firstName} ${user.lastName}`
          : `Odrzucono konto użytkownika ${user.firstName} ${user.lastName}`,
        timestamp: new Date()
      });
    }
    if (oldValues.group !== user.group) {
      changes.push(`grupa: ${oldValues.group} → ${user.group}`);
    }
    if (oldValues.firstName !== user.firstName || oldValues.lastName !== user.lastName) {
      changes.push(`imię i nazwisko: ${oldValues.firstName} ${oldValues.lastName} → ${user.firstName} ${user.lastName}`);
    }
    if (oldValues.email !== user.email) {
      changes.push(`email: ${oldValues.email} → ${user.email}`);
    }

    if (changes.length > 0) {
      await History.create({
        type: 'user_update',
        userId: session.user.id,
        userFirstName: session.user.firstName,
        userLastName: session.user.lastName,
        details: `Zaktualizowano użytkownika: ${changes.join(', ')}`,
        timestamp: new Date()
      });
    }

    return createApiResponse({
      message: 'User updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        group: user.group,
        active: user.active,
        approved: user.approved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/users/{id}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const user = await UserModel.findById(params.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    await user.deleteOne();

    // Create history entry for user deletion
    await History.create({
      type: 'user_update',
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Usunięto użytkownika ${user.firstName} ${user.lastName}`,
      timestamp: new Date()
    });

    return createApiResponse({
      message: 'User deleted successfully'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
