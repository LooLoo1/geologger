export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 10000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
  },
  location: {
    create: '/api/location',
    list: '/api/location',
    sync: '/api/location/sync',
  },
} as const;

