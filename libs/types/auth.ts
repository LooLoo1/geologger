// Shared Auth/User types for backend and frontend

export interface User {
  id: string;
  email: string;
  password?: string; // Only in backend, never sent to frontend
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

