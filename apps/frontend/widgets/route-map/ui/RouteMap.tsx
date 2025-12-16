'use client';

import React, { useMemo, useState } from 'react';
import { useLocationsQuery } from '../../../features/location/api/queries';
import { useAuthStore } from '../../../entities/user/model/store';
import { createMapProvider, getDefaultMapProvider } from '../../../shared/lib/map-provider-factory';
import type { MapProviderConfig } from '../../../shared/lib/map-provider.types';

interface RouteMapProps {
  mapProviderType?: 'leaflet' | 'google-maps';
  googleMapsApiKey?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ 
  mapProviderType = 'leaflet',
  googleMapsApiKey 
}) => {
  const { isAuthenticated } = useAuthStore();
  const { data: allLocations = [], isLoading, error } = useLocationsQuery();
  const [precision, setPrecision] = useState(1); // 1 = show every point, 2 = every 2nd, etc.
  const [zoom, setZoom] = useState(13); // Default zoom level

  // Filter locations from the last 24 hours
  const locations = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLocations = allLocations.filter((loc) => {
      const locDate = new Date(loc.timestamp);
      return locDate >= twentyFourHoursAgo;
    });

    // Sort by timestamp
    const sorted = recentLocations.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Apply precision filter - show every Nth point
    // Always include first and last points to maintain route visualization
    if (precision === 1 || sorted.length <= 2) {
      return sorted;
    }
    
    const filtered: typeof sorted = [];
    for (let i = 0; i < sorted.length; i++) {
      // Always include first point, last point, and every Nth point
      if (i === 0 || i === sorted.length - 1 || i % precision === 0) {
        filtered.push(sorted[i]);
      }
    }
    
    return filtered;
  }, [allLocations, precision]);

  // Get the last (newest) location for centering
  const lastLocation = useMemo(() => {
    if (locations.length === 0) return null;
    return locations[locations.length - 1];
  }, [locations]);

  const mapConfig: MapProviderConfig = useMemo(() => {
    const config: MapProviderConfig = {
      zoom: zoom,
    };
    
    // Center on the last (newest) location
    if (lastLocation) {
      config.center = {
        lat: lastLocation.lat,
        lng: lastLocation.lng,
      };
    }
    
    if (mapProviderType === 'google-maps' && googleMapsApiKey) {
      config.apiKey = googleMapsApiKey;
    }
    
    return config;
  }, [mapProviderType, googleMapsApiKey, zoom, lastLocation]);

  const mapProvider = useMemo(() => {
    if (mapProviderType === 'google-maps' && googleMapsApiKey) {
      return createMapProvider('google-maps', mapConfig);
    }
    return getDefaultMapProvider(mapConfig);
  }, [mapProviderType, mapConfig, googleMapsApiKey]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">Please log in to view your route</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <p className="text-red-800">Error: {error instanceof Error ? error.message : 'Failed to load locations'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Route Map (Last 24 Hours)</h2>
      
      <div className="mb-4 space-y-3">
        <div className="text-sm text-gray-600">
          {locations.length > 0 ? (
            <p>Showing {locations.length} location{locations.length !== 1 ? 's' : ''} from the last 24 hours</p>
          ) : (
            <p>No locations found in the last 24 hours</p>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label htmlFor="precision-slider" className="text-sm font-medium text-gray-700 min-w-[120px]">
              Точність: кожен {precision === 1 ? 'точку' : `${precision}-й`}
            </label>
            <input
              id="precision-slider"
              type="range"
              min="1"
              max="50"
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">{precision}</span>
          </div>
          
          {/* <div className="flex items-center gap-4">
            <label htmlFor="zoom-slider" className="text-sm font-medium text-gray-700 min-w-[120px]">
              Зум: {zoom}
            </label>
            <input
              id="zoom-slider"
              type="range"
              min="1"
              max="18"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">{zoom}</span>
          </div> */}
        </div>
      </div>
      
      <div className="h-[600px] w-full rounded-lg overflow-hidden">
        {mapProvider.render({
          locations,
          config: mapConfig,
          className: 'h-full w-full',
        })}
      </div>
    </div>
  );
};

