import { useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  altitude?: number;
}

export const useLocation = (watch: boolean = false) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, altitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude, altitude: altitude ?? undefined });
      setError(null);
    };

    const fail = (err: GeolocationPositionError) => {
      setError(err.message);
    };

    let watcher: number | null = null;

    if (watch) {
      watcher = navigator.geolocation.watchPosition(
        success, 
        fail, 
        { 
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        success, 
        fail, 
        { 
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    }

    return () => {
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
    };
  }, [watch]);

  return { location, error };
};

