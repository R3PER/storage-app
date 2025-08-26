'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn('credentials', {
        username: formData.get('username'),
        password: formData.get('password'),
        redirect: true,
        callbackUrl: '/dashboard'
      });

      if (result?.error) {
        // Handle specific error types
        switch (result.error) {
          case 'PENDING_APPROVAL':
            setError('Twoje konto oczekuje na zatwierdzenie przez administratora. Zostaniesz powiadomiony o decyzji w ciągu 24 godzin.');
            break;
          case 'ACCOUNT_INACTIVE':
            setError('Twoje konto zostało dezaktywowane. Skontaktuj się z administratorem.');
            break;
          case 'CredentialsSignin':
            setError('Nieprawidłowa nazwa użytkownika lub hasło.');
            break;
          default:
            setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
        }
        return;
      }
      
      // Przekierowanie jest obsługiwane przez signIn z redirect: true
    } catch (error) {
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg px-8 py-10 w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Panel logowania
        </h1>
        <p className="text-center text-gray-600">
          System zarządzania magazynem
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa użytkownika
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaUser className="h-5 w-5 text-gray-400" />
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Wprowadź nazwę użytkownika"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Hasło
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaLock className="h-5 w-5 text-gray-400" />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Wprowadź hasło"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaLock className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('oczekuje na zatwierdzenie') && (
                  <p className="mt-2 text-sm text-red-600">
                    Możesz skontaktować się z administratorem, aby przyspieszyć proces weryfikacji.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>

        <div className="text-center">
          <Link
            href="/register"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Nie masz konta? Zarejestruj się
          </Link>
        </div>
      </form>
    </div>
  );
}
