
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This effect handles redirection after auth state is determined.
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
      if (user && isAuthPage) {
        router.replace('/chat');
      }
      if (!user && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [user, loading, pathname, router]);

  // Don't render a global loader, let pages handle their own loading state
  // This prevents the infinite spinner issue.
  if (loading) {
    // You can return a minimal loading state or null
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
