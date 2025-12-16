export type MapProviderType = 'leaflet' | 'google-maps';

export const isValidMapProvider = (value: unknown): value is MapProviderType => {
  return value === 'leaflet' || value === 'google-maps';
};

export const getMapProviderType = (value: unknown, defaultValue: MapProviderType = 'leaflet'): MapProviderType => {
  return isValidMapProvider(value) ? value : defaultValue;
};

