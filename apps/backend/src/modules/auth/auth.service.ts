import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AuthRepository } from './auth.repository.supabase';
import { ConflictError, UnauthorizedError, InternalServerError } from '@shared/errors/AppError';
import type { RegisterDto, LoginDto, AuthResponseDto } from './auth.dto';
import type { UserWithoutPassword } from './auth.types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = data;

    try {
      // Check if user already exists
      const userExists = await this.authRepository.exists(email);
      if (userExists) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.authRepository.create({
        email,
        password: hashedPassword,
      });

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      // Якщо це вже AppError (ConflictError), просто пробрасуємо
      if (error instanceof ConflictError) {
        throw error;
      }

      // Якщо помилка про дублікат email від Supabase
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new ConflictError('User with this email already exists');
      }

      // Якщо помилка про відсутність таблиці
      if (error instanceof Error && error.message.includes('does not exist')) {
        console.error('Database table error:', error.message);
        throw new InternalServerError('Database configuration error. Please contact administrator.');
      }

      // Якщо помилка про permissions
      if (error instanceof Error && error.message.includes('Permission denied')) {
        console.error('Permission error:', error.message);
        throw new InternalServerError('Database permission error. Please check SUPABASE_SERVICE_ROLE_KEY.');
      }

      // Інші помилки логуємо та пробрасуємо як InternalServerError
      console.error('Error in register:', error);
      if (error instanceof Error) {
        throw new InternalServerError(`Registration failed: ${error.message}`);
      }
      throw new InternalServerError('Registration failed: Unknown error');
    }
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = data;

    try {
      // Find user
      const user = await this.authRepository.findByEmail(email);
      
      if (!user || !user.password) {
        console.log(`Login attempt failed: user not found for email ${email}`);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`Login attempt failed: invalid password for email ${email}`);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      // Якщо це вже UnauthorizedError, просто пробрасуємо
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      // Інші помилки (наприклад, від Supabase) логуємо
      console.error('Error in login:', error);
      throw new UnauthorizedError('Invalid credentials');
    }
  }

  async getUserById(id: string): Promise<UserWithoutPassword | null> {
    return await this.authRepository.findById(id);
  }

  private generateToken(userId: string, email: string): string {
    const payload = { userId, email };
    // expiresIn accepts string (like '7d', '1h') or number (seconds)
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions;
    
    return jwt.sign(payload, JWT_SECRET, options);
  }
}

