'use client';

import React, { useMemo, useEffect, useState } from 'react';
import type { MapProvider, MapProviderRenderProps, MapProviderConfig } from '../map-provider.types';
import type { LocationLog } from '@geologger/libs/types/location';

// Dynamic import for Leaflet to avoid SSR issues
type LeafletModule = typeof import('react-leaflet');
type LeafletCore = typeof import('leaflet');

let LeafletComponents: LeafletModule | null = null;
let L: LeafletCore | null = null;

const loadLeaflet = async (): Promise<{ LeafletComponents: LeafletModule; L: LeafletCore } | null> => {
  if (typeof window === 'undefined') return null;
  
  if (!LeafletComponents || !L) {
    const [leafletModule, leafletCoreModule] = await Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]);
    
    // Dynamically load CSS
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      if (!document.head.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    }
    
    L = leafletCoreModule as unknown as LeafletCore;
    LeafletComponents = leafletModule;
    
    // Fix for default markers in Leaflet
    if (L && 'Icon' in L && L.Icon && 'Default' in L.Icon && L.Icon.Default) {
      const DefaultIcon = L.Icon.Default as unknown as { prototype: { _getIconUrl?: unknown }; mergeOptions: (options: unknown) => void };
      delete DefaultIcon.prototype._getIconUrl;
      DefaultIcon.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }
  
  if (!LeafletComponents || !L) return null;
  return { LeafletComponents, L };
};

export class LeafletMapProvider implements MapProvider {
  name = 'leaflet';
  private config?: MapProviderConfig;

  constructor(config?: MapProviderConfig) {
    this.config = config;
  }

  render({ locations, className, style }: MapProviderRenderProps): React.ReactNode {
    return <LeafletMapComponent locations={locations} config={this.config} className={className} style={style} />;
  }
}

interface LeafletMapComponentProps {
  locations: LocationLog[];
  config?: MapProviderConfig;
  className?: string;
  style?: React.CSSProperties;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({ locations, config, className, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState<LeafletModule | null>(null);
  const [leafletCore, setLeafletCore] = useState<LeafletCore | null>(null);

  useEffect(() => {
    loadLeaflet().then((loaded) => {
      if (loaded) {
        setLeafletComponents(loaded.LeafletComponents);
        setLeafletCore(loaded.L);
        setIsLoaded(true);
      }
    });
  }, []);

  const path = useMemo(() => {
    return locations.map((loc) => [loc.lat, loc.lng] as [number, number]);
  }, [locations]);

  const center = useMemo(() => {
    if (config?.center) {
      return [config.center.lat, config.center.lng] as [number, number];
    }
    if (locations.length === 0) {
      return [50.4501, 30.5234] as [number, number]; // Default: Kyiv
    }
    // Center on the last (newest) location
    const lastLocation = locations[locations.length - 1];
    return [lastLocation.lat, lastLocation.lng] as [number, number];
  }, [locations, config]);

  const zoom = config?.zoom || (locations.length > 0 ? 13 : 10);

  if (!isLoaded || !leafletComponents || !leafletCore) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } = leafletComponents;
  const Leaflet = leafletCore as unknown as typeof import('leaflet');

  // Gradient colors from green (newest) to red (oldest)
  const gradientColors = [
    '#10b981', // green-500 - newest
    '#22c55e', // green-400
    '#34d399', // emerald-400
    '#4ade80', // green-300
    '#65e6a3', // emerald-300
    '#86efac', // green-200
    '#a7f3d0', // emerald-200
    '#bef264', // lime-300
    '#fde047', // yellow-300
    '#fbbf24', // amber-400
    '#f59e0b', // amber-500
    '#f97316', // orange-500
    '#fb923c', // orange-400
    '#f87171', // red-400
    '#ef4444', // red-500 - oldest
  ];

  // Function to get color based on position in array
  // Since locations are sorted from oldest to newest, we reverse the ratio
  // so that newest (last index) gets green and oldest (first index) gets red
  const getColorForIndex = (index: number, total: number): string => {
    if (total <= 1) return gradientColors[0];
    const ratio = (total - 1 - index) / (total - 1); // Reverse: 0 = oldest (red), 1 = newest (green)
    const colorIndex = Math.floor(ratio * (gradientColors.length - 1));
    return gradientColors[colorIndex];
  };

  // Function to format date for tooltip
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const startIcon = Leaflet.divIcon({
    className: 'custom-marker',
    html: '<div style="background-color: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">S</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const endIcon = Leaflet.divIcon({
    className: 'custom-marker',
    html: '<div style="background-color: #ef4444; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">E</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Create gradient marker icon
  const createGradientIcon = (color: string) => {
    return Leaflet.divIcon({
      className: 'gradient-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  return (
    <div className={className} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        doubleClickZoom={true}
        keyboard={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          maxNativeZoom={19}
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
        />
        {/* Gradient polylines - each segment has its own color */}
        {path.length > 1 && locations.map((location, index) => {
          // Skip last point as it's the end of the last segment
          if (index >= path.length - 1) {
            return null;
          }
          
          // Get color for this segment (based on the starting point)
          const color = getColorForIndex(index, locations.length);
          
          return (
            <Polyline
              key={`segment-${location.id}-${index}`}
              positions={[path[index], path[index + 1]]}
              pathOptions={{
                color: color,
                weight: 4,
                opacity: 0.8,
              }}
            />
          );
        })}
        {locations.length > 0 && (
          <>
            {/* Start marker */}
            <Marker position={[locations[0].lat, locations[0].lng]} icon={startIcon}>
              <Popup>Start</Popup>
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                {formatDate(locations[0].timestamp)}
              </Tooltip>
            </Marker>
            
            {/* Gradient markers for all points */}
            {locations.map((location, index) => {
              // Skip first and last (they have special markers)
              if (index === 0 || (index === locations.length - 1 && locations.length > 1)) {
                return null;
              }
              
              const color = getColorForIndex(index, locations.length);
              const markerIcon = createGradientIcon(color);
              
              return (
                <Marker
                  key={location.timestamp + index}
                  position={[location.lat, location.lng]}
                  icon={markerIcon}
                >
                  <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                    {formatDate(location.timestamp)}
                  </Tooltip>
                </Marker>
              );
            })}
            
            {/* End marker */}
            {locations.length > 1 && (
              <Marker position={[locations[locations.length - 1].lat, locations[locations.length - 1].lng]} icon={endIcon}>
                <Popup>End</Popup>
                <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                  {formatDate(locations[locations.length - 1].timestamp)}
                </Tooltip>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

