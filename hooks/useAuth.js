'use client';

import { useApp } from '@/contexts/AppContext';

/**
 * Convenience hook untuk akses auth state & helpers.
 * Returns: { token, currentUser, login, logout, updateUser, isLoggedIn }
 */
export function useAuth() {
  const { token, currentUser, login, logout, updateUser } = useApp();
  return { token, currentUser, login, logout, updateUser, isLoggedIn: !!token };
}
