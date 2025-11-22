
"use client";

import { useAuthContext } from '@/context/AuthContext';

/**
 * @deprecated use `useUser` hook from `@/firebase` instead.
 */
export const useAuth = () => {
  return useAuthContext();
};
