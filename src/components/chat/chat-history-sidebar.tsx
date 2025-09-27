'use client';

import type { ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { MessageSquareText, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onLoadSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onLoadSession,
  onNewChat,
  onDeleteSession,
}: ChatHistorySidebarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

  const handleDeleteClick = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      setShowDeleteDialog(false);
      setSessionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSessionToDelete(null);
  };
  return (
    <>
    <Sidebar side="left" className="border-r bg-sidebar text-sidebar-foreground" collapsible="icon">
      <SidebarHeader className="p-3 sticky top-0 z-20 bg-sidebar pt-16">
        <div className="flex flex-col space-y-3 w-full">
          <h2 className="text-lg font-semibold text-white px-2">Chat History</h2>
          <Button onClick={onNewChat} variant="default" size="lg" className="h-10 px-3 w-full">
            <Plus className="h-4 w-4 mr-2" />
            <span className="inline">New Chat</span>
          </Button>
        </div>
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
                <SidebarMenuItem key={session.id} className="group">
                  <div className="flex items-center w-full">
                    <SidebarMenuButton
                      onClick={() => onLoadSession(session.id)}
                      isActive={session.id === activeSessionId}
                      className={cn(
                        "flex-1 justify-start text-left h-auto py-2.5 px-3 hover:bg-sidebar-accent/10",
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(session, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{sessionToDelete?.name || 'this chat'}"? This action cannot be undone and will permanently remove all messages in this conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelDelete}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
