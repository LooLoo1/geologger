'use client';

import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import type { MapProvider, MapProviderRenderProps, MapProviderConfig } from '../map-provider.types';
import type { LocationLog } from '@geologger/libs/types/location';

export class GoogleMapsProvider implements MapProvider {
  name = 'google-maps';
  private config?: MapProviderConfig;

  constructor(config?: MapProviderConfig) {
    this.config = config;
  }

  render({ locations, className, style }: MapProviderRenderProps): React.ReactNode {
    if (!this.config?.apiKey) {
      return (
        <div className={className} style={style}>
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <p className="text-gray-600">Google Maps API key is required</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMapsMapComponent
        locations={locations}
        config={this.config}
        className={className}
        style={style}
      />
    );
  }
}

interface GoogleMapsMapComponentProps {
  locations: LocationLog[];
  config: MapProviderConfig;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleMapsMapComponent: React.FC<GoogleMapsMapComponentProps> = ({ locations, config, className, style }) => {
  const path = useMemo(() => {
    return locations.map((loc) => ({
      lat: loc.lat,
      lng: loc.lng,
    }));
  }, [locations]);

  const center = useMemo(() => {
    if (config.center) {
      return config.center;
    }
    if (locations.length === 0) {
      return { lat: 50.4501, lng: 30.5234 }; // Default: Kyiv
    }
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    return { lat: avgLat, lng: avgLng };
  }, [locations, config]);

  const zoom = config.zoom || (locations.length > 0 ? 13 : 10);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  return (
    <div className={className} style={style}>
      <LoadScript googleMapsApiKey={config.apiKey!}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={zoom}
          options={mapOptions}
        >
          {path.length > 1 && (
            <Polyline
              path={path}
              options={{
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          )}
          {locations.length > 0 && (
            <>
              <Marker
                position={{ lat: locations[0].lat, lng: locations[0].lng }}
                label="S"
                title="Start"
              />
              {locations.length > 1 && (
                <Marker
                  position={{ lat: locations[locations.length - 1].lat, lng: locations[locations.length - 1].lng }}
                  label="E"
                  title="End"
                />
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

