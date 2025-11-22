
'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

// Define the context shape
export interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

// Create the context
export const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

// Define the provider props
export interface FirebaseProviderProps {
  children: ReactNode;
  value: FirebaseContextValue;
}

// Create the provider component
export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Create a hook to use the context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
    return useFirebase().auth;
}

export function useFirestore() {
    return useFirebase().db;
}
