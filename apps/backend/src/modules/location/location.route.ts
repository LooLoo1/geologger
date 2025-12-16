import { Router, type Router as ExpressRouter } from 'express';
import { LocationController } from './location.controller';
import { authenticateToken } from '@shared/middleware/auth.middleware';

const router: ExpressRouter = Router();
const locationController = new LocationController();

// Public endpoint for logging (can be used without auth for flexibility)
router.post('/', locationController.logLocation);

// Protected endpoints
router.get('/', authenticateToken, locationController.getLocations);
router.post('/sync', authenticateToken, locationController.syncLocations);

export default router;

