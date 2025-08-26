"use client";

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsArrowLeft, BsClock, BsPencil, BsPlus } from 'react-icons/bs';
import { formatMoney } from '../../../../lib/format-utils';
import { LoadingSpinner } from '../../../admin/components/common/Loading';
import { AdminProductForm } from '../../../admin/components/forms/AdminProductForm';
import { OperationHistory } from '../../../admin/components/history/OperationHistory';
import { AdminLayout } from '../../../admin/components/layout/AdminLayout';
import { Product, ProductNote } from '../../../admin/types/admin';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const { data } = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && id) {
      loadProduct();
    }
  }, [session, id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner text="Ładowanie szczegółów produktu..." />
        </div>
      </AdminLayout>
    );
  }

  if (error || !product) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Nie znaleziono produktu'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <BsArrowLeft className="mr-2" /> Wróć
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BsArrowLeft className="mr-2" /> Wróć
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {product.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNoteForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <BsPlus className="mr-2" /> Dodaj notatkę
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <BsPencil className="mr-2" /> Edytuj
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edytuj produkt</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Zamknij</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AdminProductForm
                product={product}
                onSubmit={async (data: Partial<Product>) => {
                  try {
                    const response = await fetch(`/api/admin/products/${id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update product');
                    }

                    const { data: updatedProduct } = await response.json();
                    setProduct(updatedProduct);
                    setShowForm(false);
                  } catch (error) {
                    console.error('Error updating product:', error);
                  }
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {showNoteForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Dodaj notatkę</h3>
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Zamknij</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`/api/products/${id}/notes`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: noteContent }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to add note');
                  }

                  const { data: updatedProduct } = await response.json();
                  setProduct(updatedProduct);
                  setShowNoteForm(false);
                  setNoteContent('');
                } catch (error) {
                  console.error('Error adding note:', error);
                }
              }}>
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Treść notatki
                  </label>
                  <textarea
                    id="content"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteContent('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Dodaj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informacje o produkcie</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product._id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ilość</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.quantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cena</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatMoney(product.price)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Właściciel</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.owner || 'Brak'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data utworzenia</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('pl-PL')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Utworzony przez</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.createdBy.firstName} {product.createdBy.lastName}
                  </dd>
                </div>
                {product.lastEditedBy && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ostatnia edycja</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(product.lastEditedAt!).toLocaleDateString('pl-PL')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Edytowany przez</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.lastEditedBy.firstName} {product.lastEditedBy.lastName}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notatki</h2>
              {product.notes && product.notes.length > 0 ? (
                <div className="space-y-4">
                  {product.notes.map((note: ProductNote, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">{note.content}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <BsClock className="mr-1" />
                        {new Date(note.createdAt).toLocaleDateString('pl-PL')} - {note.createdBy.firstName} {note.createdBy.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Brak notatek</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historia zmian</h2>
          <OperationHistory limit={10} period="all" productId={id as string} />
        </div>
      </div>
    </AdminLayout>
  );
}
