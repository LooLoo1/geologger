// Shared DTO types for API communication between frontend and backend

import type { UserWithoutPassword } from './auth.js';
import type { LocationLogResponse } from './location.js';

// Auth DTOs
export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

// Location DTOs
export interface CreateLocationDto {
  lat: number;
  lng: number;
  altitude?: number;
  userId: string;
}

export interface LocationResponseDto {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  altitude?: number;
  timestamp: string;
}

export interface SyncLocationsDto {
  locations: Array<{
    lat: number;
    lng: number;
    altitude?: number;
    timestamp: string;
  }>;
}

export interface SyncLocationsResponseDto {
  success: boolean;
  synced: number;
  locations: LocationResponseDto[];
}

