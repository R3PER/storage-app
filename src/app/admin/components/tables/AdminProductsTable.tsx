// src/app/admin/components/tables/AdminProductsTable.tsx
/**
 * AdminProductsTable Component
 * Displays a table of products with actions for the admin panel.
 * Supports sorting, filtering, and CRUD operations.
 */
"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BsExclamationTriangle, BsPencil, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { formatMoney } from '../../../../lib/format-utils';
import { AdminTableProps, Product } from '../../types/admin';
import { LoadingSpinner } from '../common/Loading';

export const AdminProductsTable: React.FC<AdminTableProps> = ({
  products,
  onEdit,
  onDelete,
  user,
  loading = false
}) => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleEdit = async (product: Product) => {
    try {
      await onEdit(product);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      return;
    }

    try {
      await onDelete(id);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner text="Ładowanie produktów..." />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Brak produktów</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nazwa
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ilość
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cena
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notatki
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ostatnia aktualizacja
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Akcje</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr
              key={product._id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {product._id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${product.quantity <= 10 ? 'text-red-500' : 'text-gray-900'}`}>
                    {product.quantity}
                  </span>
                  {product.quantity <= 10 && (
                    <BsExclamationTriangle className="ml-2 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatMoney(product.price)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {product.notes && product.notes.length > 0 ? (
                    <div className="max-h-20 overflow-y-auto">
                      {product.notes.map((note, index) => (
                        <div key={index} className="mb-1 p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">{note.content}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(note.createdAt).toLocaleDateString('pl-PL')} - {note.createdBy.firstName} {note.createdBy.lastName}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">Brak notatek</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(product.lastEditedAt || product.createdAt).toLocaleDateString('pl-PL')}
                </div>
                <div className="text-sm text-gray-500">
                  {product.lastEditedBy?.firstName && product.lastEditedBy?.lastName
                    ? `${product.lastEditedBy.firstName} ${product.lastEditedBy.lastName}`
                    : product.createdBy?.firstName && product.createdBy?.lastName
                    ? `${product.createdBy.firstName} ${product.createdBy.lastName}`
                    : 'Nieznany użytkownik'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                    title="Edytuj"
                  >
                    <BsPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    title="Usuń"
                  >
                    <BsTrash className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedProduct(selectedProduct === product._id ? null : product._id)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                      title="Więcej opcji"
                    >
                      <BsThreeDotsVertical className="w-4 h-4" />
                    </button>
                    {selectedProduct === product._id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => {
                              router.push(`/admin/history?productId=${product._id}`);
                              setSelectedProduct(null);
                            }}
                          >
                            Historia zmian
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => {
                              router.push(`/admin/products/${product._id}`);
                              setSelectedProduct(null);
                            }}
                          >
                            Szczegóły
                          </button>
                        </div>
                      </div>
                    )}
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
