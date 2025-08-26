// src/app/admin/page.tsx
/**
 * Admin Page Component
 * Main entry point for the admin panel.
 * Handles initial data loading and layout.
 */
import { Suspense } from 'react';
import { LoadingGrid } from './components/common/Loading';
import { AdminLayout } from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';

export default function AdminPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingGrid items={4} />}>
        <Dashboard />
      </Suspense>
    </AdminLayout>
  );
}
