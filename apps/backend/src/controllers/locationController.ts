import type { Request, Response } from 'express';
import { createLocationLog, getUserLocations } from '../services/locationService.js';
import type { LocationLog } from '../../../../libs/types/location.js';

export const logLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, altitude, userId } = req.body;

    if (!lat || !lng || !userId) {
      res.status(400).json({ error: 'Missing required fields: lat, lng, userId' });
      return;
    }

    const location = createLocationLog({ lat, lng, altitude, userId });
    res.status(201).json(location);
  } catch (error) {
    console.error('Error logging location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const locations = getUserLocations(userId);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const syncLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { locations } = req.body as { locations: LocationLog[] };

    if (!Array.isArray(locations)) {
      res.status(400).json({ error: 'Locations must be an array' });
      return;
    }

    const syncedLocations = locations.map(loc => 
      createLocationLog({ lat: loc.lat, lng: loc.lng, altitude: loc.altitude, userId })
    );

    res.json({ 
      success: true, 
      synced: syncedLocations.length,
      locations: syncedLocations 
    });
  } catch (error) {
    console.error('Error syncing locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

