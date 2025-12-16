import type { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { validateEmail, validatePassword } from '@shared/utils/validation';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as RegisterDto;

    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);

    const result = await this.authService.register({ 
      email: validatedEmail, 
      password: validatedPassword 
    });
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginDto;

    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);

    const result = await this.authService.login({ 
      email: validatedEmail, 
      password: validatedPassword 
    });
    res.json(result);
  });
}

