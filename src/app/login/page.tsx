'use client';

import { useSearchParams } from 'next/navigation';
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        {registered === 'true' && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-700">
              Rejestracja przebiegła pomyślnie. Twoje konto oczekuje na zatwierdzenie przez administratora.
              Zostaniesz powiadomiony o decyzji w ciągu 24 godzin.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
