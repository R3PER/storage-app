"use client";

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BsBan, BsCheck2Circle, BsCircleFill, BsPencil, BsTrash, BsX } from 'react-icons/bs';
import { ExtendedUser } from '../../types/admin';

interface AdminUsersTableProps {
  users: ExtendedUser[];
  onEdit: (user: ExtendedUser) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Użytkownik
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grupa
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data dołączenia
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status konta
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status zatwierdzenia
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Akcje</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.group === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.group === 'admin' ? 'Administrator' : 'Użytkownik'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt), 'PP', { locale: pl })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                  {user.active && (
                    <span className="flex items-center">
                      <BsCircleFill className={`h-2 w-2 ${user.isOnline ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className="ml-1 text-xs text-gray-500">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {user.approved ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Zatwierdzony
                      {user.approvedBy && (
                        <span className="ml-1 text-xs text-gray-500">
                          przez {user.approvedBy.firstName} {user.approvedBy.lastName}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Oczekuje na zatwierdzenie
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <BsPencil className="h-4 w-4" />
                  </button>
                  <div className="flex space-x-2">
                  {!user.approved ? (
                    <>
                      <button
                        onClick={() => onEdit({ ...user, approved: true })}
                        className="text-green-600 hover:text-green-900"
                        title="Zatwierdź"
                      >
                        <BsCheck2Circle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Odrzuć"
                      >
                        <BsX className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onEdit({ ...user, active: !user.active })}
                      className={`${user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={user.active ? 'Dezaktywuj' : 'Aktywuj'}
                    >
                      <BsBan className="h-4 w-4" />
                    </button>
                  )}
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Usuń"
                    >
                      <BsTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
