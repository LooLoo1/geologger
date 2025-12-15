import type { LocationLog } from '@geologger/libs/types/location';
import { LocationData } from '../hooks/useLocation';
import { saveLocationOffline, getUnsyncedLocations, markLocationsAsSynced } from './storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

// Auth API
export const register = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(error.error || `Registration failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 4000.');
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || `Login failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 4000.');
    }
    throw error;
  }
};

// Location API
export const logLocation = async (
  location: LocationData,
  userId: string,
  token?: string
): Promise<LocationLog> => {
  const locationLog: Omit<LocationLog, 'timestamp'> = {
    userId,
    lat: location.lat,
    lng: location.lng,
    altitude: location.altitude,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...locationLog,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to log location');
    }

    return response.json();
  } catch (error) {
    // Save offline if network fails
    const offlineLocation: LocationLog = {
      ...locationLog,
      timestamp: new Date().toISOString(),
    };
    await saveLocationOffline(offlineLocation);
    throw error;
  }
};

export const getLocations = async (token: string): Promise<LocationLog[]> => {
  const response = await fetch(`${API_BASE_URL}/api/location`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch locations');
  }

  return response.json();
};

export const syncOfflineLocations = async (token: string): Promise<void> => {
  const unsyncedLocations = await getUnsyncedLocations();
  
  if (unsyncedLocations.length === 0) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/location/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locations: unsyncedLocations }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync locations');
    }

    const result = await response.json();
    const syncedIds = result.locations.map((loc: LocationLog) => 
      `${loc.userId}_${loc.timestamp}`
    );
    await markLocationsAsSynced(syncedIds);
  } catch (error) {
    console.error('Error syncing offline locations:', error);
    throw error;
  }
};

