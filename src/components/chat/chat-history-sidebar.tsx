'use client';

import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { PlusSquare, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onLoadSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onLoadSession,
  onNewChat,
}: ChatHistorySidebarProps) {
  return (
    <Sidebar side="left" className="border-r bg-sidebar text-sidebar-foreground" collapsible="icon">
      <SidebarHeader className="p-3">
        <Button variant="outline" className="w-full justify-start text-base font-bold" onClick={onNewChat}>
          <PlusSquare className="mr-3 h-5 w-5" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No chat history yet.
            </div>
          ) : (
            <SidebarMenu className="p-2 space-y-1">
              {sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => onLoadSession(session.id)}
                    isActive={session.id === activeSessionId}
                    className={cn(
                      "w-full justify-start text-left h-auto py-2.5 px-3",
                      session.id === activeSessionId && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                     tooltip={{
                      children: session.name || 'Chat',
                      side: "right",
                      align: "center",
                    }}
                  >
                    <MessageSquareText className="mr-3 h-4 w-4 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                       <span className="truncate text-sm font-medium">
                        {session.name || 'Chat'}
                      </span>
                      <span className="text-xs text-muted-foreground/80">
                        {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
