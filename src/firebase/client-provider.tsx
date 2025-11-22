
'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider, FirebaseContextValue } from './provider';
import { initializeFirebase } from '@/lib/firebase/config';

export interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseValue: FirebaseContextValue = useMemo(() => {
    const { app, auth, db } = initializeFirebase();
    return { app, auth, db };
  }, []);

  return (
    <FirebaseProvider value={firebaseValue}>
      {children}
    </FirebaseProvider>
  );
}
