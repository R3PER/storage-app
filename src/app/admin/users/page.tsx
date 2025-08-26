"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { AdminUserForm } from '../components/forms/AdminUserForm';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminUsersTable } from '../components/tables/AdminUsersTable';
import { ExtendedUser } from '../types/admin';

export default function UsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | undefined>();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const { data } = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Nie udało się załadować listy użytkowników');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadUsers();
    }
  }, [session]);

  // Auto-refresh for pending approvals
  useEffect(() => {
    if (filter === 'pending') {
      const interval = setInterval(loadUsers, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [filter]);

  const handleSubmit = async (data: Partial<ExtendedUser>) => {
    try {
      setError(null);
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingUser ? 'update' : 'create'} user`);
      }

      await loadUsers();
      setShowForm(false);
      setEditingUser(undefined);
    } catch (error) {
      console.error('Error submitting user:', error);
      setError(`Nie udało się ${editingUser ? 'zaktualizować' : 'utworzyć'} użytkownika`);
    }
  };

  const handleEdit = async (user: ExtendedUser) => {
    if (user.approved !== undefined) {
      // Handle approval/rejection
      const action = user.approved ? 'zatwierdzić' : 'odrzucić';
      if (!window.confirm(`Czy na pewno chcesz ${action} tego użytkownika?`)) {
        return;
      }
    }
    
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Nie udało się zaktualizować użytkownika');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Nie udało się usunąć użytkownika');
      throw error; // Re-throw to handle in the UI
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner text="Ładowanie użytkowników..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Zarządzanie użytkownikami
              </h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Wszyscy użytkownicy</option>
                <option value="pending">Oczekujący na zatwierdzenie</option>
                <option value="approved">Zatwierdzeni</option>
              </select>
              <button
                onClick={() => loadUsers()}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Odśwież
              </button>
            </div>
            <button 
              onClick={() => {
                setEditingUser(undefined);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Dodaj użytkownika
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingUser ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingUser(undefined);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Zamknij</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <AdminUserForm
                  user={editingUser}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingUser(undefined);
                  }}
                />
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <AdminUsersTable
              users={users.filter(user => {
                if (filter === 'pending') return !user.approved;
                if (filter === 'approved') return user.approved;
                return true;
              })}
              onEdit={handleEdit}
              onDelete={async (userId: string) => {
                if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
                  try {
                    await handleDelete(userId);
                  } catch (err) {
                    // Error is already handled in handleDelete
                  }
                }
              }}
            />
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
