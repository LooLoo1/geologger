import { Router, type Router as ExpressRouter } from 'express';
import { register, login } from '../controllers/authController.js';

const router: ExpressRouter = Router();

router.post('/register', register);
router.post('/login', login);

export default router;

