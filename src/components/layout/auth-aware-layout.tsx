'use client';

import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';

interface AuthAwareLayoutProps {
  children: React.ReactNode;
}

export default function AuthAwareLayout({ children }: AuthAwareLayoutProps) {
  const pathname = usePathname();
  
  // Determine if this is an app page that requires authentication
  const isAppPage = pathname.startsWith('/chat') || pathname.startsWith('/profile');
  
  // If it's an app page, show the app layout (middleware ensures user is authenticated)
  if (isAppPage) {
    return (
      <AppLayout>
        {children}
      </AppLayout>
    );
  }
  
  // For all other cases (auth pages, landing page), render children directly
  return <>{children}</>;
}
