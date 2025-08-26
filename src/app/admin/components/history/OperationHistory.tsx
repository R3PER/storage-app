// src/app/admin/components/history/OperationHistory.tsx
/**
 * OperationHistory Component
 * Displays a list of recent operations and changes in the system.
 */
"use client";

import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { BsExclamationCircle, BsFileText, BsPencil, BsPlus } from 'react-icons/bs';
import { OperationHistoryItem } from '../../types/admin';
import { LoadingSpinner } from '../common/Loading';

interface OperationHistoryProps {
  limit?: number;
  period?: string;
  productId?: string;
  autoRefresh?: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
      >
        Poprzednia
      </button>
      <span className="text-sm text-gray-600">
        Strona {currentPage} z {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
      >
        Następna
      </button>
    </div>
  );
};

import { BsBoxArrowInDown, BsCurrencyDollar, BsLock, BsPeople, BsTrash } from 'react-icons/bs';

const getOperationStyle = (type: string) => {
  const styles = {
    // Product operations
    'product_create': {
      bg: 'bg-green-100',
      icon: <BsPlus className="w-4 h-4 text-green-600" />
    },
    'product_update': {
      bg: 'bg-blue-100',
      icon: <BsPencil className="w-4 h-4 text-blue-600" />
    },
    'product_delete': {
      bg: 'bg-red-100',
      icon: <BsTrash className="w-4 h-4 text-red-600" />
    },
    // Note operations
    'note_add': {
      bg: 'bg-purple-100',
      icon: <BsFileText className="w-4 h-4 text-purple-600" />
    },
    'note_edit': {
      bg: 'bg-indigo-100',
      icon: <BsPencil className="w-4 h-4 text-indigo-600" />
    },
    'note_delete': {
      bg: 'bg-red-100',
      icon: <BsTrash className="w-4 h-4 text-red-600" />
    },
    // User operations
    'user_update': {
      bg: 'bg-yellow-100',
      icon: <BsPencil className="w-4 h-4 text-yellow-600" />
    },
    'user_create': {
      bg: 'bg-green-100',
      icon: <BsPlus className="w-4 h-4 text-green-600" />
    },
    'user_delete': {
      bg: 'bg-red-100',
      icon: <BsTrash className="w-4 h-4 text-red-600" />
    },
    'user_ban': {
      bg: 'bg-red-100',
      icon: <BsLock className="w-4 h-4 text-red-600" />
    },
    'user_role_change': {
      bg: 'bg-yellow-100',
      icon: <BsPeople className="w-4 h-4 text-yellow-600" />
    },
    // Inventory operations
    'inventory_update': {
      bg: 'bg-blue-100',
      icon: <BsBoxArrowInDown className="w-4 h-4 text-blue-600" />
    },
    'price_update': {
      bg: 'bg-green-100',
      icon: <BsCurrencyDollar className="w-4 h-4 text-green-600" />
    }
  };

  return styles[type as keyof typeof styles] || {
    bg: 'bg-gray-100',
    icon: <BsPencil className="w-4 h-4 text-gray-600" />
  };
};

const MetadataDisplay: React.FC<{ metadata?: Record<string, any> }> = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  return (
    <div className="mt-2 text-sm text-gray-500">
      {metadata.previousValue !== undefined && metadata.newValue !== undefined && (
        <div className="flex items-center space-x-2">
          <span className="line-through">{metadata.previousValue}</span>
          <span>→</span>
          <span className="font-medium">{metadata.newValue}</span>
        </div>
      )}
      {metadata.reason && (
        <div className="mt-1">
          <span className="font-medium">Powód: </span>
          {metadata.reason}
        </div>
      )}
      {metadata.affectedFields && metadata.affectedFields.length > 0 && (
        <div className="mt-1">
          <span className="font-medium">Zmienione pola: </span>
          {metadata.affectedFields.join(', ')}
        </div>
      )}
    </div>
  );
};

export const OperationHistory: React.FC<OperationHistoryProps> = ({ 
  limit = 10, 
  period = '30', 
  productId,
  autoRefresh = true 
}) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<OperationHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHistory = async (page: number) => {
    try {
      setLoading(true);
      let url = `/api/admin/history?page=${page}&limit=${limit}&period=${period}`;
        if (productId) {
          url += `&productId=${productId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const { data } = await response.json();
        if (!data || !Array.isArray(data.items)) {
          throw new Error('Invalid response format');
        }
        setHistory(data.items);
        setTotalPages(data.totalPages || Math.ceil(data.total / limit));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

  // Initial load and refresh effect
  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage, limit, period, productId, refreshKey]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      loadHistory(currentPage);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [autoRefresh, currentPage]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleRefresh}
          className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
        >
          Odśwież
        </button>
        {autoRefresh && (
          <span className="text-sm text-gray-500">
            Auto-odświeżanie co 30 sekund
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner text="Ładowanie historii..." />
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <BsExclamationCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Brak historii operacji</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">↑ Najnowsze</span>
              <span className="text-sm text-gray-500">↓ Najstarsze</span>
            </div>
          </div>

          {history.map((operation) => (
            <div
              key={operation._id}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-lg ${getOperationStyle(operation.type).bg}`}>
                  {getOperationStyle(operation.type).icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-gray-900">
                    {operation.userFirstName} {operation.userLastName}
                  </p>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(operation.timestamp), {
                      addSuffix: true,
                      locale: pl,
                    })}
                  </span>
                </div>
            <p className="text-sm text-gray-500 mt-1">
              {operation.details}
            </p>
            <MetadataDisplay metadata={operation.metadata} />
            {operation.productName && (
              <p className="text-sm text-gray-400 mt-1">
                Produkt: {operation.productName}
              </p>
            )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default OperationHistory;
