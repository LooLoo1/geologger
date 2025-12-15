'use client';

import { LocationLogger } from '../components/LocationLogger';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, loading, logout, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">GeoLogger</h1>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Logged in as: {user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        <main>
          {isAuthenticated ? (
            <LocationLogger />
          ) : (
            <AuthForm />
          )}
        </main>
      </div>
    </div>
  );
}
