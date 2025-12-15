import type { LocationLog } from '../../../../libs/types/location.js';
import { saveLocation, getLocationsByUserId } from '../models/locationModel.js';

export const createLocationLog = (locationData: Omit<LocationLog, 'timestamp'>): LocationLog => {
  const location: LocationLog = {
    ...locationData,
    timestamp: new Date().toISOString(),
  };
  return saveLocation(location);
};

export const getUserLocations = (userId: string): LocationLog[] => {
  return getLocationsByUserId(userId);
};

