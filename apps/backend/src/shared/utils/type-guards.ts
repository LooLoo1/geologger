import type { Request } from 'express';
import type { AuthRequest } from '@shared/types/express';

export const isAuthRequest = (req: Request): req is AuthRequest => {
  return 'user' in req && req.user !== undefined;
};

export const getUserId = (req: Request): string | null => {
  if (isAuthRequest(req)) {
    return req.user?.userId || null;
  }
  return null;
};

