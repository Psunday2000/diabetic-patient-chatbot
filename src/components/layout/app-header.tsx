
'use client';

import { LogOut, MessageCircle, PanelLeft, User } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    await signOut(); // This clears the server-side cookie
    router.push('/');
  }

  return (
    <header className="bg-white text-foreground p-4 shadow-sm sticky top-0 z-50 flex items-center justify-between border-b">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-foreground hover:bg-background/80 md:hidden">
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Toggle History</span>
          </Button>
        )}
        <MessageCircle className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">MediChat</h1>
      </div>
      <div className="flex items-center">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'Guest'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
