import type { LocationLog } from '../../../../libs/types/location.js';

// In-memory storage for MVP (replace with database later)
const locationStore: LocationLog[] = [];

export const saveLocation = (location: LocationLog): LocationLog => {
  locationStore.push(location);
  return location;
};

export const getLocationsByUserId = (userId: string): LocationLog[] => {
  return locationStore.filter(loc => loc.userId === userId);
};

export const getAllLocations = (): LocationLog[] => {
  return locationStore;
};

