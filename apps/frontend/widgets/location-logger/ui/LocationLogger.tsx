'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '../../../features/location/lib/useLocation';
import { useLogLocationMutation, useSyncLocationsMutation } from '../../../features/location/api/queries';
import { useAuthStore } from '../../../entities/user/model/store';

export const LocationLogger: React.FC = () => {
  const { location, error } = useLocation(true);
  const { user, isAuthenticated, token } = useAuthStore();
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogged, setLastLogged] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const logMutation = useLogLocationMutation();
  const syncMutation = useSyncLocationsMutation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isAuthenticated && token) {
        syncMutation.mutate();
      }
    };
    const handleOffline = () => setIsOnline(false);

    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, token, syncMutation]);

  useEffect(() => {
    if (location && isAuthenticated && user && !isLogging) {
      const logLocationAsync = async () => {
        setIsLogging(true);
        try {
          // Try to log online first
          if (isOnline) {
            try {
              await logMutation.mutateAsync({ location, userId: user.id });
              setLastLogged(new Date());
            } catch (error) {
              // If online request fails, save offline
              console.warn('Online log failed, saving offline:', error);
              await saveLocationOffline(location, user.id);
            }
          } else {
            // Save offline if not online
            await saveLocationOffline(location, user.id);
          }
        } catch (error) {
          console.error('Failed to save location:', error);
        } finally {
          setIsLogging(false);
        }
      };
      logLocationAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isAuthenticated, user, isOnline]);

  // Helper function to save location offline
  const saveLocationOffline = async (loc: typeof location, userId: string) => {
    if (!loc) return;
    
    try {
      const { storageService } = await import('../../../shared/lib/storage');
      await storageService.saveLocationOffline({
        id: `${userId}_${Date.now()}`,
        userId,
        lat: loc.lat,
        lng: loc.lng,
        altitude: loc.altitude,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      setLastLogged(new Date());
      
      // Try to register background sync
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // @ts-expect-error - sync API may not be in TypeScript types
          if (registration.sync) {
            // @ts-expect-error - sync API may not be in TypeScript types
            await registration.sync.register('sync-locations');
          }
        } catch (syncError) {
          console.warn('Background sync not available:', syncError);
        }
      }
    } catch (error) {
      console.error('Failed to save location offline:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-3 sm:p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-xs sm:text-sm text-yellow-800">Please log in to start logging your location</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Location Logger</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs sm:text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline - Locations will be saved locally'}
          </span>
        </div>

        {error && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {location ? (
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2 text-xs sm:text-sm">
              <div className="break-words">
                <span className="font-semibold text-gray-800">Latitude:</span>
                <span className="ml-2 text-gray-700">{location.lat.toFixed(6)}</span>
              </div>
              <div className="break-words">
                <span className="font-semibold text-gray-800">Longitude:</span>
                <span className="ml-2 text-gray-700">{location.lng.toFixed(6)}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="font-semibold text-gray-800">Altitude:</span>
                <span className="ml-2 text-gray-700">
                  {location.altitude ? `${location.altitude.toFixed(2)}m` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-600">Getting location...</p>
        )}

        {isLogging && (
          <p className="text-xs sm:text-sm text-blue-600">Logging location...</p>
        )}

        {lastLogged && (
          <p className="text-xs sm:text-sm text-gray-500">
            Last logged: {lastLogged.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

