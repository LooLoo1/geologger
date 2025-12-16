import { apiClient } from './client';
import { API_ENDPOINTS } from '../config/api';
import type { LocationLog } from '@geologger/libs/types/location';
import type { CreateLocationDto, SyncLocationsDto, SyncLocationsResponseDto } from '@geologger/libs/types/dto';

// Re-export for convenience
export type { CreateLocationDto, SyncLocationsDto };
export type SyncLocationsResponse = SyncLocationsResponseDto;

export const locationApi = {
  create: async (data: CreateLocationDto): Promise<LocationLog> => {
    const response = await apiClient.post<LocationLog>(
      API_ENDPOINTS.location.create,
      data
    );
    return response.data;
  },

  list: async (): Promise<LocationLog[]> => {
    const response = await apiClient.get<LocationLog[]>(
      API_ENDPOINTS.location.list
    );
    return response.data;
  },

  sync: async (data: SyncLocationsDto): Promise<SyncLocationsResponse> => {
    const response = await apiClient.post<SyncLocationsResponse>(
      API_ENDPOINTS.location.sync,
      data
    );
    return response.data;
  },
};

