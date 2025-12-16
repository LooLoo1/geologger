// Re-export types from shared package for convenience
export type {
  LocationLog,
  CreateLocationData,
  LocationLogResponse,
} from '@geologger/libs/types/location';

export type SupabaseLocationLog = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  altitude: number | null;
  timestamp: string;
  synced: boolean;
}