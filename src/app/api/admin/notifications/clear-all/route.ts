import {
    checkAdminAuth,
    createApiResponse,
    handleApiError
} from '../../../../../lib/api-utils';

// DELETE /api/admin/notifications/clear-all
export async function DELETE(request: Request) {
  try {
    await checkAdminAuth();

    // Since notifications are generated dynamically, we'll just return success
    // The frontend will handle clearing them in the UI
    return createApiResponse({
      message: 'All notifications cleared'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
