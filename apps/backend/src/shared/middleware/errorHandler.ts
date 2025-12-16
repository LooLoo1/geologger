import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Log unexpected errors with full stack trace
  console.error('Unexpected error:', err);
  if (err.stack) {
    console.error('Stack trace:', err.stack);
  }

  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
};

