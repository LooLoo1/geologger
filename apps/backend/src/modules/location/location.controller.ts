import type { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '@shared/errors/AppError';
import type { AuthRequest } from '@shared/types/express';
import { LocationService } from './location.service';
import type { CreateLocationDto, SyncLocationsDto } from './location.dto';

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  logLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { lat, lng, altitude, userId: bodyUserId } = req.body as CreateLocationDto;
    
    // Use userId from auth middleware if available, otherwise from body
    const userId = (req as AuthRequest).user?.userId || bodyUserId;

    if (!lat || !lng || !userId) {
      throw new BadRequestError('Missing required fields: lat, lng, userId');
    }

    const location = await this.locationService.createLocation({
      lat,
      lng,
      userId,
      ...(altitude !== undefined && { altitude }),
    });

    res.status(201).json(location);
  });

  getLocations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const locations = await this.locationService.getUserLocations(userId);
    res.json(locations);
  });

  syncLocations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const { locations } = req.body as SyncLocationsDto;

    if (!Array.isArray(locations)) {
      throw new BadRequestError('Locations must be an array');
    }

    const result = await this.locationService.syncLocations(userId, { locations });
    res.json(result);
  });
}

