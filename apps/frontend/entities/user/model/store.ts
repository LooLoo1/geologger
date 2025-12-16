'use client';

import { useState, useEffect } from 'react';
import type { User, AuthState } from './types';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const useAuthStore = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      if (typeof Storage === 'undefined' || !window.localStorage) {
        setLoading(false);
        return;
      }

      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setState({
              user: parsedUser,
              token: storedToken,
              isAuthenticated: true,
            });
          } catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      } catch {
        // Silently handle storage errors
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 300);

    loadAuthState();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const setAuth = (user: User, token: string) => {
    setState({
      user,
      token,
      isAuthenticated: true,
    });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const clearAuth = () => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return {
    ...state,
    loading,
    setAuth,
    clearAuth,
  };
};

