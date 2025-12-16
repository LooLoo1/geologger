import type { LocationLog } from '@geologger/libs/types/location';

/**
 * Обчислює відстань між двома точками у метрах (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Радіус Землі в метрах
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Розраховує статистику маршруту
 */
export interface RouteStats {
  totalDistance: number; // в метрах
  totalTime: number; // в секундах
  averageSpeed: number; // в м/с
  pointsCount: number;
}

export const calculateRouteStats = (locations: LocationLog[]): RouteStats => {
  if (locations.length < 2) {
    return {
      totalDistance: 0,
      totalTime: 0,
      averageSpeed: 0,
      pointsCount: locations.length,
    };
  }

  let totalDistance = 0;
  
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }

  const firstTimestamp = new Date(locations[0].timestamp).getTime();
  const lastTimestamp = new Date(locations[locations.length - 1].timestamp).getTime();
  const totalTime = (lastTimestamp - firstTimestamp) / 1000; // в секундах

  const averageSpeed = totalTime > 0 ? totalDistance / totalTime : 0;

  return {
    totalDistance,
    totalTime,
    averageSpeed,
    pointsCount: locations.length,
  };
};

/**
 * Форматує відстань у читабельний вигляд
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }
  return `${(meters / 1000).toFixed(2)} км`;
};

/**
 * Форматує час у читабельний вигляд
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} сек`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes} хв ${secs > 0 ? `${secs} сек` : ''}`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} год ${minutes > 0 ? `${minutes} хв` : ''}`;
};

/**
 * Форматує швидкість у читабельний вигляд
 */
export const formatSpeed = (metersPerSecond: number): string => {
  const kmPerHour = (metersPerSecond * 3600) / 1000;
  return `${kmPerHour.toFixed(1)} км/год`;
};

