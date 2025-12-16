import { prisma } from '@lib/prisma';
import type { CreateLocationData, LocationLogResponse } from './location.types';

export class LocationRepository {
  async create(data: CreateLocationData): Promise<LocationLogResponse> {
    const created = await prisma.locationLog.create({
      data: {
        userId: data.userId,
        lat: data.lat,
        lng: data.lng,
        altitude: data.altitude ?? null,
        timestamp: data.timestamp ?? new Date(),
        synced: true,
      },
    });

    return this.toResponse(created);
  }

  async findByUserId(userId: string): Promise<LocationLogResponse[]> {
    const locations = await prisma.locationLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    return locations.map(this.toResponse);
  }

  async createMany(locations: CreateLocationData[]): Promise<LocationLogResponse[]> {
    await prisma.locationLog.createMany({
      data: locations.map((loc) => ({
        userId: loc.userId,
        lat: loc.lat,
        lng: loc.lng,
        altitude: loc.altitude ?? null,
        timestamp: loc.timestamp ?? new Date(),
        synced: true,
      })),
    });

    // Fetch created locations (createMany doesn't return records)
    const userIds = [...new Set(locations.map((loc) => loc.userId))];
    const latestLocations = await prisma.locationLog.findMany({
      where: { userId: { in: userIds } },
      orderBy: { timestamp: 'desc' },
      take: locations.length,
    });

    return latestLocations.map(this.toResponse);
  }

  private toResponse(location: {
    id: string;
    userId: string;
    lat: number;
    lng: number;
    altitude: number | null;
    timestamp: Date;
  }): LocationLogResponse {
    return {
      id: location.id,
      userId: location.userId,
      lat: location.lat,
      lng: location.lng,
      ...(location.altitude !== null && { altitude: location.altitude }),
      timestamp: location.timestamp.toISOString(),
    };
  }
}

