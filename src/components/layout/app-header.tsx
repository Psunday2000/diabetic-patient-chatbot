'use client';

import { MessageCircle, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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
    </header>
  );
}
