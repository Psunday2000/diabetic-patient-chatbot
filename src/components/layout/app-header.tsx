'use client';

import { MessageCircle, PanelLeft, User } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

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
        <h1 className="text-2xl font-bold">DiaChat</h1>
      </div>
      <div className="flex items-center">
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
                <p className="text-sm font-medium leading-none">Guest</p>
                <p className="text-xs leading-none text-muted-foreground">
                  guest@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
