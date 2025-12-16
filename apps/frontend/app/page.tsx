'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LocationLogger } from '../widgets/location-logger/ui/LocationLogger';
import { AuthForm } from '../features/auth/ui/AuthForm';
import { useAuthStore } from '../entities/user/model/store';
import { getMapProviderType } from '../shared/utils/type-guards';

// Dynamically import RouteMap to avoid SSR issues with Leaflet
const RouteMap = dynamic(
  () => import('../widgets/route-map/ui/RouteMap').then((mod) => ({ default: mod.RouteMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center h-[400px] sm:h-[500px] md:h-[600px]">
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const { isAuthenticated, loading, clearAuth, user } = useAuthStore();
  const [forceShow, setForceShow] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapProviderType = getMapProviderType(process.env.NEXT_PUBLIC_MAP_PROVIDER);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading && !forceShow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-900 text-base sm:text-lg">Loading...</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 sm:mb-6 md:mb-8 flex-wrap flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">GeoLogger</h1>
          {isAuthenticated && (
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-600 break-all sm:break-normal">
                Logged in as: {user?.email}
              </span>
              <button
                onClick={clearAuth}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="space-y-4 sm:space-y-6">
          {isAuthenticated ? (
            <>
              <LocationLogger />
              <RouteMap 
                mapProviderType={mapProviderType}
                googleMapsApiKey={googleMapsApiKey || undefined}
              />
            </>
          ) : (
            <AuthForm />
          )}
        </main>
      </div>
    </div>
  );
}
