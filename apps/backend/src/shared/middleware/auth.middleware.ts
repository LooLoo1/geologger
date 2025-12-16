import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@shared/errors/AppError';
import type { AuthRequest } from '@shared/types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// TEMPORARY: Auto-authenticate as specific user (bypassing auth)
const TEMP_USER_ID = 'ee7769cf-70e3-4bff-a436-8ce61179238f';
const TEMP_USER_EMAIL = 'vitalii.petriv.viburnum@gmail.com';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TEMPORARY: Auto-authenticate as specific user
  (req as AuthRequest).user = {
    userId: TEMP_USER_ID,
    email: TEMP_USER_EMAIL,
  };
  next();
  
  // Original auth code (commented out temporarily):
  /*
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
  */
};

