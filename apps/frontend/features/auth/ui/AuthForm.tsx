'use client';

import React, { useState } from 'react';
import { useLoginMutation, useRegisterMutation } from '../api/queries';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const mutation = isLogin ? loginMutation : registerMutation;
  const error = mutation.error instanceof Error ? mutation.error.message : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
        {isLogin ? 'Login' : 'Register'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 text-sm sm:text-base rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? 'Loading...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="mt-3 sm:mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            mutation.reset();
          }}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

