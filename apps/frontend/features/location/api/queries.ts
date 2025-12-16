import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../../../shared/api/location';
import { storageService } from '../../../shared/lib/storage';
import type { LocationLog } from '@geologger/libs/types/location';

export interface LocationData {
  lat: number;
  lng: number;
  altitude?: number;
}

export const useLocationsQuery = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: locationApi.list,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useLogLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ location, userId }: { location: LocationData; userId: string }) => {
      try {
        return await locationApi.create({
          ...location,
          userId,
        });
      } catch (error) {
        // Save offline if network fails
        const timestamp = new Date().toISOString();
        const offlineLocation: LocationLog = {
          id: `${userId}_${timestamp}`,
          userId,
          lat: location.lat,
          lng: location.lng,
          altitude: location.altitude,
          timestamp,
        };
        await storageService.saveLocationOffline(offlineLocation);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useSyncLocationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const unsyncedLocations = await storageService.getUnsyncedLocations();
      
      if (unsyncedLocations.length === 0) {
        return { success: true, synced: 0, locations: [] };
      }

      const result = await locationApi.sync({ locations: unsyncedLocations });
      const syncedIds = result.locations.map((loc) => loc.id);
      await storageService.markLocationsAsSynced(syncedIds);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

