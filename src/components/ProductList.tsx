'use client';

import { Product } from '@/types/index';
import { useEffect, useState } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Błąd podczas pobierania produktów');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Błąd podczas usuwania produktu');
      fetchProducts();
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded shadow">
          <h3 className="font-bold">{product.name}</h3>
          <p>Cena: {product.price} zł</p>
          <p>Ilość: {product.quantity}</p>
          <p>Data dodania: {new Date(product.createdAt).toLocaleString()}</p>
          <button
            onClick={() => product._id && handleDelete(product._id)}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Usuń
          </button>
        </div>
      ))}
    </div>
  );
}