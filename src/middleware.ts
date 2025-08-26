// src/middleware.ts
/**
 * Middleware
 * Handles authentication and route protection for the application.
 * Ensures admin routes are only accessible by admin users.
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/admin');

    // Check if user is trying to access admin routes
    if ((isAdminRoute || isApiAdminRoute) && token?.group !== 'admin') {
      // If accessing admin API, return 401
      if (isApiAdminRoute) {
        return new NextResponse(
          JSON.stringify({ message: 'Unauthorized' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      // If accessing admin pages, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow authenticated requests to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token // Require authentication for all protected routes
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Configure protected routes
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',
    // Protected routes
    '/profile',
    '/api/products/:path*',
  ]
};
