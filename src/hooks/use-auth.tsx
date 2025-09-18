
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      const isAuthPage = pathname === '/login' || pathname === '/signup';
      const isAppPage = pathname.startsWith('/chat') || pathname.startsWith('/profile');

      if (currentUser) {
        // If user is logged in and on an auth page, redirect to chat
        if (isAuthPage) {
          router.replace('/chat');
        }
      } else {
        // If user is not logged in and on a protected app page, redirect to login
        if (isAppPage) {
          router.replace('/login');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return { user, loading };
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAppPage = pathname.startsWith('/chat') || pathname.startsWith('/profile');
  
  if (loading) {
    return (
      <div className="flex flex-1 h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // While loading is false, we might still be redirecting.
  // This prevents a flicker of the old page before the redirect happens.
  if (!user && isAppPage) {
      return (
          <div className="flex flex-1 h-screen items-center justify-center bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      );
  }

  if (user && isAuthPage) {
      return (
          <div className="flex flex-1 h-screen items-center justify-center bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

