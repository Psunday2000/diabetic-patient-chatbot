
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

      if (currentUser && isAuthPage) {
        router.replace('/chat');
      } else if (!currentUser && isAppPage) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once.


  if (loading) {
    return (
      <div className="flex flex-1 h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAppPage = pathname.startsWith('/chat') || pathname.startsWith('/profile');

  // Prevent rendering auth pages if user is logged in, and vice-versa
  // This logic is now safe because the redirect in useEffect will have already been queued
  if (user && isAuthPage) return null; 
  if (!user && isAppPage) return null; 

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
