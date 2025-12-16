// Shared Location types for backend and frontend

export interface LocationLog {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  altitude?: number;
  timestamp: string; // ISO string format
  synced?: boolean; // Only used in backend
}

export interface CreateLocationData {
  userId: string;
  lat: number;
  lng: number;
  altitude?: number;
  timestamp?: Date;
}

export interface LocationLogResponse {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  altitude?: number;
  timestamp: string;
}
