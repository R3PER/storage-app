"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { AdminProductForm } from '../components/forms/AdminProductForm';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminProductsTable } from '../components/tables/AdminProductsTable';
import { Product } from '../types/admin';

export default function ProductsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const { data } = await response.json();
      console.log('Products data received:', data);
      setProducts(data?.items || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadProducts();
    }
  }, [session]);

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${data._id ? 'update' : 'create'} product`);
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
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

      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner text="Ładowanie produktów..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Zarządzanie produktami
            </h1>
            <button 
              onClick={() => {
                setEditingProduct(undefined);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Dodaj produkt
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingProduct ? 'Edytuj produkt' : 'Dodaj nowy produkt'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(undefined);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Zamknij</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <AdminProductForm
                  product={editingProduct}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingProduct(undefined);
                  }}
                />
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <AdminProductsTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              user={session?.user || null}
            />
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
