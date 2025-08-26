// src/app/admin/pages/Dashboard.tsx
"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  BsBox,
  BsCurrencyDollar,
  BsExclamationTriangle,
  BsGraphUp
} from 'react-icons/bs';
import { StatCard } from '../components/cards/StatCard';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { LoadingGrid, LoadingSpinner } from '../components/common/Loading';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { OperationHistory } from '../components/history/OperationHistory';
import { AdminProductsTable } from '../components/tables/AdminProductsTable';
import { DashboardStats, Product } from '../types/admin';

export default function Dashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, productsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/products?limit=5')
        ]);

        if (!statsResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, productsData] = await Promise.all([
          statsResponse.json(),
          productsResponse.json()
        ]);

        setStats(statsData.data);
        setProducts(productsData.data?.items || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingGrid items={4} />
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <LoadingSpinner text="Ładowanie danych..." center />
        </div>
      </div>
    );
  }

  const totalProducts = stats?.basicStats?.totalProducts ?? 0;
  const totalValue = stats?.basicStats?.totalValue ?? 0;
  const lowStockItems = stats?.basicStats?.lowStockItems ?? 0;
  const monthlyRevenue = stats?.basicStats?.monthlyRevenue ?? 0;
  const revenueGrowth = stats?.basicStats?.revenueGrowth ?? 0;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Produkty w magazynie"
            value={totalProducts}
            icon={BsBox}
          />
          <StatCard
            title="Wartość magazynu"
            value={`${totalValue.toFixed(2)} zł`}
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
            value={`${monthlyRevenue.toFixed(2)} zł`}
            icon={BsGraphUp}
            trend="up"
            change={revenueGrowth}
          />
        </div>

        {/* Charts */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Statystyki i trendy
          </h2>
          <DashboardCharts
            revenueData={stats?.trends?.revenue ?? { labels: [], values: [] }}
            inventoryData={stats?.trends?.inventory ?? { labels: [], values: [] }}
          />
        </div>

        {/* Recent Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Ostatnie produkty
            </h2>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Zobacz wszystkie
            </button>
          </div>
          <AdminProductsTable
            products={products.slice(0, 5)}
            onEdit={async (product) => {
              try {
                const response = await fetch(`/api/admin/products`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(product),
                });

                if (!response.ok) {
                  throw new Error('Failed to update product');
                }

                // Refresh products list
                const updatedResponse = await fetch('/api/admin/products?limit=5');
                const data = await updatedResponse.json();
                setProducts(data.data?.items || []);
              } catch (error) {
                console.error('Error updating product:', error);
              }
            }}
            onDelete={async (productId) => {
              if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) {
                return;
              }

              try {
                const response = await fetch(`/api/admin/products?id=${productId}`, {
                  method: 'DELETE',
                });

                if (!response.ok) {
                  throw new Error('Failed to delete product');
                }

                // Remove product from state
                setProducts(products.filter(p => p._id !== productId));
              } catch (error) {
                console.error('Error deleting product:', error);
              }
            }}
            user={session.user}
          />
        </div>

        {/* Operation History */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Historia operacji
            </h2>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Zobacz wszystkie
            </button>
          </div>
          <OperationHistory limit={5} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
