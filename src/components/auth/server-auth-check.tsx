import { getCurrentUser } from '@/app/auth/actions';
import { redirect } from 'next/navigation';

interface ServerAuthCheckProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default async function ServerAuthCheck({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ServerAuthCheckProps) {
  if (requireAuth) {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect(redirectTo);
    }
  }
  
  return <>{children}</>;
}
