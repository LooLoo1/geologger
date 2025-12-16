import { apiClient } from './client';
import { API_ENDPOINTS } from '../config/api';
import type { AuthResponseDto, LoginDto, RegisterDto } from '@geologger/libs/types/dto';

// Re-export for convenience
export type { LoginDto, RegisterDto };
export type AuthResponse = AuthResponseDto;

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      data
    );
    return response.data;
  },
};

