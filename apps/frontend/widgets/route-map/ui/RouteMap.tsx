'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useLocationsQuery } from '../../../features/location/api/queries';
import { useAuthStore } from '../../../entities/user/model/store';
import { createMapProvider, getDefaultMapProvider } from '../../../shared/lib/map-provider-factory';
import type { MapProviderConfig } from '../../../shared/lib/map-provider.types';
import {
  getTimePeriod,
  setTimePeriod,
  getDetailLevel,
  setDetailLevel,
  getRefetchInterval,
  setRefetchInterval,
  getTimePeriodStart,
  TIME_PERIOD_OPTIONS,
  resetSettingsToDefaults,
  DEFAULT_TIME_PERIOD,
  DEFAULT_DETAIL_LEVEL,
  DEFAULT_REFETCH_INTERVAL,
  type TimePeriod,
} from '../../../shared/lib/settings';
import {
  calculateRouteStats,
  formatDistance,
  formatDuration,
  formatSpeed,
} from '../../../shared/utils/route-stats';

interface RouteMapProps {
  mapProviderType?: 'leaflet' | 'google-maps';
  googleMapsApiKey?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ 
  mapProviderType = 'leaflet',
  googleMapsApiKey 
}) => {
  const { isAuthenticated } = useAuthStore();
  const { data: allLocations = [], isLoading, error, dataUpdatedAt, refetch, isRefetching } = useLocationsQuery();
  const [timePeriod, setTimePeriodState] = useState<TimePeriod>(() => getTimePeriod());
  const [precision, setPrecision] = useState(() => getDetailLevel()); // За замовчуванням 4 = 25% точок
  const [refetchInterval, setRefetchIntervalState] = useState(() => getRefetchInterval());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const zoom = 25; // Default zoom level

  // Оновлюємо localStorage при зміні періоду
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriodState(period);
    setTimePeriod(period);
  };

  // Оновлюємо localStorage при зміні деталізації
  const handlePrecisionChange = (newPrecision: number) => {
    setPrecision(newPrecision);
    setDetailLevel(newPrecision);
  };

  // Оновлюємо localStorage при зміні інтервалу оновлення
  const handleRefetchIntervalChange = (newInterval: number) => {
    setRefetchIntervalState(newInterval);
    setRefetchInterval(newInterval);
  };

  // Скидання налаштувань до значень за замовчуванням
  const handleResetSettings = () => {
    setTimePeriodState(DEFAULT_TIME_PERIOD);
    setPrecision(DEFAULT_DETAIL_LEVEL);
    setRefetchIntervalState(DEFAULT_REFETCH_INTERVAL);
    resetSettingsToDefaults();
  };

  // Filter locations based on selected time period
  const locations = useMemo(() => {
    const periodStart = getTimePeriodStart(timePeriod);
    
    let filteredLocations = allLocations;
    
    // Якщо не "все", фільтруємо за часом
    if (periodStart !== null) {
      filteredLocations = allLocations.filter((loc) => {
        const locDate = new Date(loc.timestamp);
        return locDate >= periodStart;
      });
    }

    // Sort by timestamp
    const sorted = filteredLocations.sort((a, b) => 
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
  }, [allLocations, timePeriod, precision]);

  // Статистика маршруту
  const routeStats = useMemo(() => {
    return calculateRouteStats(locations);
  }, [locations]);

  // Обробка ESC для виходу з fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

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

  // Підрахунок відсотка точок для відображення
  const displayedPercentage = useMemo(() => {
    if (precision === 1) return 100;
    return Math.round((1 / precision) * 100);
  }, [precision]);

  // Текст для періоду часу
  const periodLabel = useMemo(() => {
    return TIME_PERIOD_OPTIONS.find(opt => opt.value === timePeriod)?.label || timePeriod;
  }, [timePeriod]);

  if (!isAuthenticated) {
    return (
      <div className="p-3 sm:p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-xs sm:text-sm text-yellow-800">Please log in to view your route</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center h-[400px] sm:h-[500px] md:h-[600px]">
          <p className="text-gray-600">Loading route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 border rounded-lg bg-red-50 border-red-200">
        <p className="text-xs sm:text-sm text-red-800">Error: {error instanceof Error ? error.message : 'Failed to load locations'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Route Map</h2>
      
      <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
        {/* Статистика та інформація */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600">
            {locations.length > 0 ? (
              <p>Показано {locations.length} точок за {periodLabel.toLowerCase()}</p>
            ) : (
              <p>Не знайдено точок за {periodLabel.toLowerCase()}</p>
            )}
          </div>
          
          {/* Кнопки управління */}
          <div className="flex flex-wrap items-center gap-2">
            {dataUpdatedAt && (
              <span className="text-xs text-gray-500" title="Останнє оновлення">
                Оновлено: {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Оновити дані зараз"
            >
              {isLoading || isRefetching ? 'Оновлення...' : 'Оновити'}
            </button>
            <button
              onClick={handleResetSettings}
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              title="Скинути налаштування до значень за замовчуванням"
            >
              Скинути
            </button>
          </div>
        </div>

        {/* Статистика маршруту */}
        {locations.length >= 2 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-gray-700">Відстань:</span>
                <p className="text-gray-900">{formatDistance(routeStats.totalDistance)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Час:</span>
                <p className="text-gray-900">{formatDuration(routeStats.totalTime)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Швидкість:</span>
                <p className="text-gray-900">{formatSpeed(routeStats.averageSpeed)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Точок:</span>
                <p className="text-gray-900">{routeStats.pointsCount}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 sm:space-y-3">
          {/* Випадаючий список для вибору періоду */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label htmlFor="time-period-select" className="text-xs sm:text-sm font-medium text-gray-700 sm:min-w-[140px]">
              Період часу:
            </label>
            <select
              id="time-period-select"
              value={timePeriod}
              onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
              className="flex-1 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm text-black border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIME_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Слайдер для деталізації */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label htmlFor="precision-slider" className="text-xs sm:text-sm font-medium text-gray-700 sm:min-w-[140px]">
              Деталізація: {displayedPercentage}%
            </label>
            <input
              id="precision-slider"
              type="range"
              min="1"
              max="20"
              value={precision}
              onChange={(e) => handlePrecisionChange(Number(e.target.value))}
              className="flex-1 w-full sm:w-auto h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs sm:text-sm text-gray-600 sm:min-w-[60px]">
              {precision === 1 ? 'Всі' : `1/${precision}`}
            </span>
          </div>

          {/* Налаштування інтервалу оновлення */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label htmlFor="refetch-interval-input" className="text-xs sm:text-sm font-medium text-gray-700 sm:min-w-[140px]">
              Інтервал оновлення:
            </label>
            <input
              id="refetch-interval-input"
              type="number"
              min="1000"
              step="1000"
              value={refetchInterval}
              onChange={(e) => handleRefetchIntervalChange(Number(e.target.value))}
              className="flex-1 w-full sm:w-auto px-3 py-2 text-xs sm:text-sm text-black border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs sm:text-sm text-gray-600 sm:min-w-[80px]">
              ({Math.round(refetchInterval / 1000)} сек)
            </span>
          </div>
        </div>
      </div>
      
      {/* Контейнер карти з можливістю fullscreen */}
      <div
        className={`relative ${
          isFullscreen
            ? 'fixed inset-0 z-[9998] bg-white'
            : 'h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-lg'
        }`}
        style={isFullscreen ? { zIndex: 9998 } : undefined}
      >
        {/* Контейнер карти з overflow-hidden для обрізання закруглених кутів */}
        <div className={`${isFullscreen ? ' w-full h-full' : 'h-full w-full rounded-lg overflow-hidden'}`}>
          {mapProvider.render({
            locations,
            config: mapConfig,
            className: `${isFullscreen ? 'w-screen h-screen top-0 left-0 fixed' : 'h-full w-full'}`,
          })}
        </div>
        {/* Кнопка перемикання fullscreen у правому нижньому куті - поверх карти */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg flex items-center gap-2"
          style={{ zIndex: 10000, position: 'absolute' }}
          title={isFullscreen ? 'Закрити повноекранний режим (ESC)' : 'Відкрити повноекранний режим'}
        >
          {isFullscreen ? (
            <>
              <span>✕</span>
              <span className="hidden sm:inline">Закрити</span>
            </>
          ) : (
            <>
              <span>⛶</span>
              <span className="hidden sm:inline">Повний екран</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

