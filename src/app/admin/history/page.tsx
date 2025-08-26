"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BsArrowClockwise } from 'react-icons/bs';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { OperationHistory } from '../components/history/OperationHistory';
import { AdminLayout } from '../components/layout/AdminLayout';

export default function HistoryPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState('30');
  const [isPopulating, setIsPopulating] = useState(false);
  const [populateError, setPopulateError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/history?page=1&limit=1000&period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch history data');
      
      const data = await response.json();
      const items = data.items || [];
      
      // Format the data for CSV
      const csvContent = [
        // CSV Header
        ['Data', 'Typ', 'Użytkownik', 'Szczegóły', 'Produkt'].join(','),
        // CSV Rows
        ...items.map((item: any) => [
          new Date(item.timestamp).toLocaleString('pl-PL'),
          item.type,
          `${item.userFirstName} ${item.userLastName}`,
          item.details.replace(/,/g, ';'), // Replace commas with semicolons to avoid CSV issues
          item.productName || ''
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historia_operacji_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Export error:', error);
      setPopulateError('Błąd podczas eksportu danych');
    }
  };

  const handlePopulateHistory = async () => {
    try {
      setIsPopulating(true);
      setPopulateError(null);
      
      const response = await fetch('/api/admin/history/populate', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji historii');
      }

      // Refresh the history component by updating its key
      setHistoryKey(prev => prev + 1);
    } catch (error) {
      setPopulateError(error instanceof Error ? error.message : 'Wystąpił błąd');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Historia operacji
            </h1>
            <div className="flex items-center space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="7">Ostatnie 7 dni</option>
                <option value="30">Ostatnie 30 dni</option>
                <option value="90">Ostatnie 90 dni</option>
                <option value="all">Wszystkie</option>
              </select>
              <button
                onClick={handlePopulateHistory}
                disabled={isPopulating}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 ${
                  isPopulating ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2`}
              >
                <BsArrowClockwise className={`w-4 h-4 mr-2 ${isPopulating ? 'animate-spin' : ''}`} />
                {isPopulating ? 'Aktualizowanie...' : 'Aktualizuj historię'}
              </button>
              <button 
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Eksportuj
              </button>
            </div>
          </div>

          {populateError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{populateError}</p>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg p-6">
            <OperationHistory 
              key={historyKey}
              limit={50} 
              period={period} 
              autoRefresh={true}
            />
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
