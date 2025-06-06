'use client';

import { MessageSquareHeart, History, PanelLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden">
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Toggle History</span>
          </Button>
        )}
        <MessageSquareHeart className="h-8 w-8" />
        <h1 className="text-2xl font-headline font-bold">DiaChat</h1>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Chat History"
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors hidden md:flex" // Hide on mobile, sidebar toggle is panelleft
              onClick={toggleSidebar}
            >
              <History className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-background text-foreground border-border shadow-lg rounded-md">
            <p>Toggle Chat History</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}
