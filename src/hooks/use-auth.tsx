
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
        if (isAuthPage) {
          router.replace('/chat');
        }
      } else {
        if (isAppPage) {
          router.replace('/login');
        }
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]); // Dependency on pathname and router to react to route changes

  return { user, loading };
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const pathname = usePathname();
  
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
  // This flicker-prevention logic is now safe because the redirect in useEffect will handle navigation
  if (!loading) {
    if (user && isAuthPage) return null;
    if (!user && isAppPage) return null;
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

