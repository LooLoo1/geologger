import type { LocationLog } from '@geologger/libs/types/location';

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapRoute {
  points: MapPoint[];
  startPoint?: MapPoint;
  endPoint?: MapPoint;
}

export interface MapProviderConfig {
  apiKey?: string;
  center?: MapPoint;
  zoom?: number;
}

export interface MapProvider {
  name: string;
  render: (props: MapProviderRenderProps) => React.ReactNode;
}

export interface MapProviderRenderProps {
  locations: LocationLog[];
  config?: MapProviderConfig;
  className?: string;
  style?: React.CSSProperties;
}

