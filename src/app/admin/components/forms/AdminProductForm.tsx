// src/app/admin/components/forms/AdminProductForm.tsx
"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Product } from '../../types/admin';

interface AdminProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
}) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    owner: '',
    note: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        owner: product.owner,
        note: '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      console.error('No user session found');
      return;
    }

    const submitData: Partial<Product> = {
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      owner: formData.owner,
    };

    if (product?._id) {
      // Editing existing product
      submitData._id = product._id;
      if (formData.note.trim()) {
        submitData.notes = [
          ...(product.notes || []),
          {
            content: formData.note.trim(),
            createdBy: {
              id: session.user.id,
              firstName: session.user.firstName,
              lastName: session.user.lastName,
            },
            createdAt: new Date(),
            isNew: true,
            isUpdated: false
          }
        ];
      }
    } else {
      // Creating new product
      if (formData.note.trim()) {
        submitData.notes = [{
          content: formData.note.trim(),
          createdBy: {
            id: session.user.id,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
          },
          createdAt: new Date(),
          isNew: true,
          isUpdated: false
        }];
      }
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nazwa produktu</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cena</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ilość</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Właściciel</label>
        <input
          type="text"
          value={formData.owner}
          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dodaj notatkę</label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Dodaj nową notatkę..."
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        />
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
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {product ? 'Zapisz zmiany' : 'Dodaj produkt'}
        </button>
      </div>
    </form>
  );
};
