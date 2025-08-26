"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ExtendedUser } from '../../types/admin';

interface AdminUserFormProps {
  user?: ExtendedUser;
  onSubmit: (data: Partial<ExtendedUser>) => Promise<void>;
  onCancel: () => void;
}

export const AdminUserForm: React.FC<AdminUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
}) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    group: 'user',
    active: true,
    approved: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        group: user.group,
        active: user.active,
        approved: user.approved || false
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      console.error('No user session found');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700">Imię</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nazwisko</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Grupa</label>
        <select
          value={formData.group}
          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        >
          <option value="user">Użytkownik</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">Aktywny</span>
          </label>
        </div>

        {user && (
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.approved}
                onChange={(e) => {
                  if (!e.target.checked || window.confirm('Czy na pewno chcesz zatwierdzić tego użytkownika?')) {
                    setFormData({ ...formData, approved: e.target.checked });
                  }
                }}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Zatwierdzony</span>
            </label>
            {user.approvedBy && (
              <p className="mt-1 text-xs text-gray-500">
                Zatwierdzony przez: {user.approvedBy.firstName} {user.approvedBy.lastName}
                {user.approvedAt && ` (${new Date(user.approvedAt).toLocaleDateString()})`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {user ? 'Zapisz zmiany' : 'Dodaj użytkownika'}
        </button>
      </div>
    </form>
  );
};
