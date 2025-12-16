import type { MapProvider, MapProviderConfig } from './map-provider.types';
import { LeafletMapProvider } from './map-providers/leaflet';
import { GoogleMapsProvider } from './map-providers/google-maps';

export type MapProviderType = 'leaflet' | 'google-maps';

const providers: Record<MapProviderType, (config?: MapProviderConfig) => MapProvider> = {
  leaflet: (config) => new LeafletMapProvider(config),
  'google-maps': (config) => new GoogleMapsProvider(config),
};

export const createMapProvider = (
  type: MapProviderType = 'leaflet',
  config?: MapProviderConfig
): MapProvider => {
  const providerFactory = providers[type];
  if (!providerFactory) {
    throw new Error(`Unknown map provider: ${type}`);
  }
  return providerFactory(config);
};

export const getDefaultMapProvider = (config?: MapProviderConfig): MapProvider => {
  return createMapProvider('leaflet', config);
};

