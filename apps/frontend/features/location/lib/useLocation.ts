import { useState, useEffect, useRef } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  altitude?: number;
}

// Конфігурація частоти оновлення локації
const LOCATION_UPDATE_INTERVAL = 5000; // 5 секунд мінімальний інтервал
const MIN_DISTANCE_METERS = 5; // Мінімальна відстань для нового оновлення (метри)

export const useLocation = (watch: boolean = false) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && !navigator.geolocation) {
      return 'Geolocation is not supported';
    }
    return null;
  });
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastLocationRef = useRef<LocationData | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    // Request Wake Lock for background location tracking
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && watch) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock acquired for background location tracking');
          
          // Re-acquire wake lock when visibility changes
          document.addEventListener('visibilitychange', async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
              try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
              } catch (err) {
                console.warn('Failed to re-acquire wake lock:', err);
              }
            }
          });
        } catch (err) {
          console.warn('Wake Lock not supported or failed:', err);
        }
      }
    };

    requestWakeLock();

    // Функція для обчислення відстані між двома точками (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371000; // Радіус Землі в метрах
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, altitude } = pos.coords;
      const now = Date.now();
      const newLocation: LocationData = { 
        lat: latitude, 
        lng: longitude, 
        altitude: altitude ?? undefined 
      };

      // Перевірка часу - не частіше ніж LOCATION_UPDATE_INTERVAL
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      if (timeSinceLastUpdate < LOCATION_UPDATE_INTERVAL) {
        return; // Пропускаємо оновлення, якщо ще не минув мінімальний інтервал
      }

      // Перевірка відстані - оновлюємо тільки якщо змінилася на MIN_DISTANCE_METERS
      if (lastLocationRef.current) {
        const distance = calculateDistance(
          lastLocationRef.current.lat,
          lastLocationRef.current.lng,
          latitude,
          longitude
        );
        if (distance < MIN_DISTANCE_METERS && timeSinceLastUpdate < LOCATION_UPDATE_INTERVAL * 2) {
          return; // Пропускаємо якщо відстань мала і час невеликий
        }
      }

      // Оновлюємо локацію
      setLocation(newLocation);
      setError(null);
      lastUpdateTimeRef.current = now;
      lastLocationRef.current = newLocation;
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
          maximumAge: LOCATION_UPDATE_INTERVAL, // Використовуємо кешовані дані якщо вони свіжі
          timeout: 10000
        }
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        success, 
        fail, 
        { 
          enableHighAccuracy: true,
          maximumAge: LOCATION_UPDATE_INTERVAL,
          timeout: 10000
        }
      );
    }

    return () => {
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(console.warn);
      }
    };
  }, [watch]);

  return { location, error };
};

