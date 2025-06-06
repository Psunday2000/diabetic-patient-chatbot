'use client';

import { HelpCircle, MessageSquareHeart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquareHeart className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">DiaChat</h1>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Help and Information"
                className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              >
                <HelpCircle className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground border-border shadow-lg rounded-md">
              <p>Help & Info (coming soon)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
