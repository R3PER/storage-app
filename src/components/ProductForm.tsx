'use client';

import { useState } from 'react';

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
        }),
      });

      if (!res.ok) throw new Error('Błąd podczas dodawania produktu');

      setFormData({ name: '', price: '', quantity: '' });
      // Tutaj możesz dodać odświeżenie listy produktów
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1">
          Nazwa
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="price" className="block mb-1">
          Cena
        </label>
        <input
          type="number"
          id="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="quantity" className="block mb-1">
          Ilość
        </label>
        <input
          type="number"
          id="quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Dodaj produkt
      </button>
    </form>
  );
}