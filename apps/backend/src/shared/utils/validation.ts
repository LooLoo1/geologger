import { BadRequestError } from '@shared/errors/AppError';

export const validateEmail = (email: unknown): string => {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new BadRequestError('Valid email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new BadRequestError('Invalid email format');
  }

  return email.trim().toLowerCase();
};

export const validatePassword = (password: unknown): string => {
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw new BadRequestError('Password is required');
  }

  if (password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  return password;
};

export const validateRequired = <T>(value: T | null | undefined, fieldName: string): T => {
  if (value === null || value === undefined) {
    throw new BadRequestError(`${fieldName} is required`);
  }
  return value;
};

