import { Router, type Router as ExpressRouter } from 'express';
import { logLocation, getLocations, syncLocations } from '../controllers/locationController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router: ExpressRouter = Router();

// Public endpoint for logging (can be secured later)
router.post('/', logLocation);

// Protected endpoints
router.get('/', authenticateToken, getLocations);
router.post('/sync', authenticateToken, syncLocations);

export default router;

