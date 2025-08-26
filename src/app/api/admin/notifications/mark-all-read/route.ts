import {
    checkAdminAuth,
    createApiResponse,
    handleApiError
} from '../../../../../lib/api-utils';

// PUT /api/admin/notifications/mark-all-read
export async function PUT(request: Request) {
  try {
    await checkAdminAuth();

    // Since notifications are generated dynamically, we'll just return success
    // The frontend will handle marking them as read in the UI
    return createApiResponse({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
