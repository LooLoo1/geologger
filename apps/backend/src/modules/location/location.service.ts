import { LocationRepository } from './location.repository.supabase';
import type { CreateLocationDto, LocationResponseDto, SyncLocationsDto, SyncLocationsResponseDto } from './location.dto';
import type { CreateLocationData } from './location.types';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async createLocation(data: CreateLocationDto): Promise<LocationResponseDto> {
    return await this.locationRepository.create({
      userId: data.userId,
      lat: data.lat,
      lng: data.lng,
      ...(data.altitude !== undefined && { altitude: data.altitude }),
    });
  }

  async getUserLocations(userId: string): Promise<LocationResponseDto[]> {
    return await this.locationRepository.findByUserId(userId);
  }

  async syncLocations(userId: string, data: SyncLocationsDto): Promise<SyncLocationsResponseDto> {
    const locationsToSync: CreateLocationData[] = data.locations.map((loc) => ({
      userId,
      lat: loc.lat,
      lng: loc.lng,
      ...(loc.altitude !== undefined && { altitude: loc.altitude }),
      ...(loc.timestamp && { timestamp: new Date(loc.timestamp) }),
    }));

    const syncedLocations = await this.locationRepository.createMany(locationsToSync);

    return {
      success: true,
      synced: syncedLocations.length,
      locations: syncedLocations,
    };
  }
}

