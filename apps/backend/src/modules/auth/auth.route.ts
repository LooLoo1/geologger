import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from './auth.controller';

const router: ExpressRouter = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;

