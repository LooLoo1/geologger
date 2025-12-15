'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { logLocation, syncOfflineLocations } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const LocationLogger: React.FC = () => {
  const { location, error } = useLocation(true);
  const { token, user, isAuthenticated } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogged, setLastLogged] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isAuthenticated && token) {
        syncOfflineLocations(token).catch(console.error);
      }
    };
    const handleOffline = () => setIsOnline(false);

    // Set initial online status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (location && isAuthenticated && user && !isLogging) {
      const logLocationAsync = async () => {
        setIsLogging(true);
        try {
          await logLocation(location, user.id, token || undefined);
          setLastLogged(new Date());
        } catch (err) {
          console.error('Failed to log location:', err);
          // Location is saved offline automatically by the API service
        } finally {
          setIsLogging(false);
        }
      };
      logLocationAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isAuthenticated, user, token]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">Please log in to start logging your location</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Location Logger</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline - Locations will be saved locally'}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {location ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Latitude:</span>
                <span className="ml-2">{location.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="font-semibold">Longitude:</span>
                <span className="ml-2">{location.lng.toFixed(6)}</span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Altitude:</span>
                <span className="ml-2">
                  {location.altitude ? `${location.altitude.toFixed(2)}m` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Getting location...</p>
        )}

        {isLogging && (
          <p className="text-sm text-blue-600">Logging location...</p>
        )}

        {lastLogged && (
          <p className="text-sm text-gray-500">
            Last logged: {lastLogged.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

