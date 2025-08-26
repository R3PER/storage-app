'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaEdit, FaSearch, FaSort, FaStickyNote, FaTrash } from 'react-icons/fa';

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
}

interface Note {
  _id?: string;
  content: string;
  createdBy: UserDetails;
  createdAt: Date;
  updatedBy?: UserDetails;
  updatedAt?: Date;
  isNew: boolean;
  isUpdated: boolean;
}

interface Product {
  _id: string;
  owner: string;
  name: string;
  quantity: number;
  price: number;
  createdBy: UserDetails;
  createdAt: Date;
  lastEditedBy?: UserDetails;
  lastEditedAt?: Date;
  notes: Note[];
}

interface SortConfig {
  key: keyof Product;
  direction: 'asc' | 'desc';
}

export default function InventoryTable() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [newProduct, setNewProduct] = useState({
    owner: '',
    name: '',
    quantity: '',
    price: ''
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Błąd podczas pobierania produktów');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError('Nie udało się pobrać produktów');
      console.error('Error fetching products:', err);
    }
  };

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
  
    setSortConfig({ key, direction });
  
    const sorted = [...filteredProducts].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
  
      // Obsługa wartości undefined
      if (valA === undefined && valB === undefined) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
  
      // Obsługa dat
      if (key === 'createdAt' || key === 'lastEditedAt') {
        const dateA = new Date(valA as string | Date);
        const dateB = new Date(valB as string | Date);
        return direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
  
      // Obsługa stringów
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
  
      // Obsługa liczb
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
  
      return 0;
    });
  
    setFilteredProducts(sorted);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: newProduct.owner,
          name: newProduct.name,
          quantity: Number(newProduct.quantity),
          price: Number(newProduct.price),
        }),
      });

      if (!response.ok) throw new Error('Błąd podczas dodawania produktu');

      await fetchProducts();
      setNewProduct({ owner: '', name: '', quantity: '', price: '' });
    } catch (err) {
      setError('Nie udało się dodać produktu');
      console.error('Error adding product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !session?.user) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: editingProduct.owner,
          name: editingProduct.name,
          quantity: editingProduct.quantity,
          price: editingProduct.price,
        }),
      });

      if (!response.ok) throw new Error('Błąd podczas aktualizacji produktu');

      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError('Nie udało się zaktualizować produktu');
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (productId: string) => {
    if (!newNote.trim() || !session?.user) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote,
        }),
      });

      if (!response.ok) throw new Error('Błąd podczas dodawania notatki');

      await fetchProducts();
      setNewNote('');
      setSelectedProduct(null);
    } catch (err) {
      setError('Nie udało się dodać notatki');
      console.error('Error adding note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?') || !session?.user) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Błąd podczas usuwania produktu');

      await fetchProducts();
    } catch (err) {
      setError('Nie udało się usunąć produktu');
      console.error('Error deleting product:', err);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Wyszukiwarka */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Wyszukaj po nazwie lub właścicielu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Formularz dodawania/edycji */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">
          {editingProduct ? 'Edytuj produkt' : 'Dodaj nowy produkt'}
        </h3>
        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Właściciel
                <span className="text-gray-500 text-sm ml-1">(opcjonalne)</span>
              </label>
              <input
                type="text"
                value={editingProduct?.owner || newProduct.owner}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, owner: e.target.value })
                    : setNewProduct({ ...newProduct, owner: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nazwa produktu
                <span className="text-red-500 text-sm ml-1">*</span>
              </label>
              <input
                type="text"
                value={editingProduct?.name || newProduct.name}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ilość
                <span className="text-red-500 text-sm ml-1">*</span>
              </label>
              <input
                type="number"
                value={editingProduct?.quantity || newProduct.quantity}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        quantity: Number(e.target.value),
                      })
                    : setNewProduct({ ...newProduct, quantity: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cena (zł)
                <span className="text-red-500 text-sm ml-1">*</span>
              </label>
              <input
                type="number"
                value={editingProduct?.price || newProduct.price}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            {editingProduct && (
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading
                ? editingProduct
                  ? 'Zapisywanie...'
                  : 'Dodawanie...'
                : editingProduct
                ? 'Zapisz zmiany'
                : 'Dodaj produkt'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista produktów */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'owner', label: 'Właściciel' },
                  { key: 'name', label: 'Nazwa' },
                  { key: 'quantity', label: 'Ilość' },
                  { key: 'price', label: 'Cena' },
                  { key: 'createdAt', label: 'Data dodania' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as keyof Product)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      {label}
                      <FaSort className="ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wartość
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notatki
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.owner || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>{formatDate(product.createdAt)}</div>
                      {product.createdBy && (
                        <div className="text-gray-500">
                          Dodał: {product.createdBy.firstName || 'Nieznany'} {product.createdBy.lastName || ''}
                        </div>
                      )}
                      {product.lastEditedBy && (
                        <div className="text-gray-500 mt-1">
                          <div>Edytował: {product.lastEditedBy.firstName || 'Nieznany'} {product.lastEditedBy.lastName || ''}</div>
                          <div>({formatDate(product.lastEditedAt!)})</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(product.quantity * product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Notatki"
                    >
                      <div className="flex items-center">
                        <FaStickyNote className="h-5 w-5" />
                        {product.notes.length > 0 && (
                          <span className="ml-1">({product.notes.length})</span>
                        )}
                        {product.notes.some(note => note.isNew) && (
                          <span className="ml-1 px-2 py-1 text-xs bg-green-500 text-white rounded">
                            NEW
                          </span>
                        )}
                        {product.notes.some(note => note.isUpdated && !note.isNew) && (
                          <span className="ml-1 px-2 py-1 text-xs bg-blue-500 text-white rounded">
                            UPDATE
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edytuj"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Usuń"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal notatek */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Notatki dla produktu: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {selectedProduct.notes.length > 0 ? (
                selectedProduct.notes.map((note, index) => (
                  <div key={note._id || index} className="bg-gray-50 p-4 rounded relative">
                    {note.isNew && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        NEW
                      </span>
                    )}
                    {note.isUpdated && !note.isNew && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        UPDATE
                      </span>
                    )}
                    <p className="mb-2 whitespace-pre-wrap">{note.content}</p>
                    <div className="text-sm text-gray-500">
                      
                      <div>Dodał: {note.createdBy?.firstName || 'Nieznany'} {note.createdBy?.lastName || ''}</div>
                      <div>Data: {formatDate(note.createdAt)}</div>
                      {note.updatedBy && (
                        <>
                          <div className="mt-1">
                            <div>Edytował: {note.updatedBy?.firstName || 'Nieznany'} {note.updatedBy?.lastName || ''}</div>
                            <div>Data edycji: {formatDate(note.updatedAt!)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Brak notatek dla tego produktu
                </p>
              )}
            </div>

            <div className="space-y-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Dodaj nową notatkę..."
                className="w-full p-2 border rounded focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Zamknij
                </button>
                <button
                  onClick={() => handleAddNote(selectedProduct._id)}
                  disabled={loading || !newNote.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${
                    (loading || !newNote.trim()) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Dodawanie...' : 'Dodaj notatkę'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
