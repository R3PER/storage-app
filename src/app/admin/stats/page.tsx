"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BsBox, BsCurrencyDollar, BsExclamationTriangle, BsGraphUp } from 'react-icons/bs';
import { formatMoney } from '../../../lib/format-utils';
import { fetchDashboardStats } from '../adminApi';
import { StatCard } from '../components/cards/StatCard';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardStats } from '../types/admin';

export default function StatsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadStats();
    }
  }, [session]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner text="Ładowanie statystyk..." />
        </div>
      </AdminLayout>
    );
  }

  const totalProducts = stats?.basicStats?.totalProducts ?? 0;
  const totalValue = stats?.basicStats?.totalValue ?? 0;
  const lowStockItems = stats?.basicStats?.lowStockItems ?? 0;
  const monthlyRevenue = stats?.basicStats?.monthlyRevenue ?? 0;
  const revenueGrowth = stats?.basicStats?.revenueGrowth ?? 0;

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Statystyki i analityka
          </h1>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Produkty w magazynie"
              value={totalProducts}
              icon={BsBox}
            />
            <StatCard
              title="Wartość magazynu"
              value={formatMoney(totalValue)}
              icon={BsCurrencyDollar}
            />
            <StatCard
              title="Niski stan magazynowy"
              value={lowStockItems}
              icon={BsExclamationTriangle}
              trend="down"
              change={-lowStockItems}
            />
            <StatCard
              title="Przychód miesięczny"
              value={formatMoney(monthlyRevenue)}
              icon={BsGraphUp}
              trend="up"
              change={revenueGrowth}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Trendy i wykresy
            </h2>
            <DashboardCharts
              revenueData={stats?.trends?.revenue ?? { labels: [], values: [] }}
              inventoryData={stats?.trends?.inventory ?? { labels: [], values: [] }}
            />
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
