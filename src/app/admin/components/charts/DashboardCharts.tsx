// src/app/admin/components/charts/DashboardCharts.tsx
/**
 * DashboardCharts Component
 * Displays revenue and inventory charts for the admin dashboard.
 * Uses Chart.js for responsive and interactive data visualization.
 */
"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ChartProps } from '../../types/admin';
import { LoadingSpinner } from '../common/Loading';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Common chart options
const commonOptions: Partial<ChartOptions<'line' | 'bar'>> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      bodyFont: {
        size: 14,
        family: "'Inter', sans-serif"
      },
      titleFont: {
        size: 14,
        family: "'Inter', sans-serif",
        weight: 'bold'
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
};

export const DashboardCharts: React.FC<ChartProps> = ({
  revenueData,
  inventoryData,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((key) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow-sm h-80 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Ładowanie wykresu..." />
          </div>
        ))}
      </div>
    );
  }

  // Revenue chart configuration
  const revenueChartData = {
    labels: revenueData.labels || [],
    datasets: [
      {
        label: 'Przychód',
        data: revenueData.values || [],
        fill: false,
        backgroundColor: 'rgb(66, 133, 244)',
        borderColor: 'rgb(66, 133, 244)',
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  // Inventory chart configuration
  const inventoryChartData = {
    labels: inventoryData.labels || [],
    datasets: [
      {
        label: 'Stan magazynowy',
        data: inventoryData.values || [],
        backgroundColor: 'rgb(66, 133, 244)',
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 40
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Przychód miesięczny
          </h3>
          <div className="text-sm text-gray-500">
            Ostatnie 6 miesięcy
          </div>
        </div>
        <div className="h-[300px]">
          <Line
            data={revenueChartData}
            options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales?.y,
                  ticks: {
                    ...commonOptions.scales?.y?.ticks,
                    callback: function(value: number | string) {
                      return typeof value === 'number' ? `${value.toLocaleString()} zł` : value;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Stan magazynowy według kategorii
          </h3>
          <div className="text-sm text-gray-500">
            Aktualne dane
          </div>
        </div>
        <div className="h-[300px]">
          <Bar
            data={inventoryChartData}
            options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales?.y,
                  ticks: {
                    ...commonOptions.scales?.y?.ticks,
                    callback: function(value: number | string) {
                      return typeof value === 'number' ? value.toLocaleString() : value;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
