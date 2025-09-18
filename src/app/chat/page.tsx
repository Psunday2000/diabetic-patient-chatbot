
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Message, QuickReply, ChatSession } from '@/lib/types';
import { getBotResponse, getChatSessions, createNewChatSession, addMessageToSession, updateSessionName } from '@/app/actions';
import ChatInterface from '@/components/chat/chat-interface';
import ChatHistorySidebar from '@/components/chat/chat-history-sidebar';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const initialBotMessageText = "Hi! I'm MediChat. I'm here to help you with your medical questions. How can I assist you today?";

function generateSessionName(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.sender === 'user');
  if (firstUserMessage && firstUserMessage.text.trim()) {
    const name = firstUserMessage.text.trim();
    return name.substring(0, 30) + (name.length > 30 ? '...' : '');
  }
  return `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}


export default function ChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  const createNewSession = useCallback(async () => {
    const newSessionId = crypto.randomUUID();
    const now = new Date();
    const initialMessage: Message = {
      id: crypto.randomUUID(),
      text: initialBotMessageText,
      sender: 'bot',
      timestamp: now,
      avatar: true,
    };
    const newSession: ChatSession = {
      id: newSessionId,
      userId: '', // This will be set on the server
      name: `New Chat ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: [initialMessage],
      startTime: now,
      lastActivity: now,
    };
    
    await createNewChatSession(newSession);
    const sessions = await getChatSessions();
    setChatSessions(sessions);
    setActiveChatSessionId(newSession.id);
  }, []);

  const handleNewChat = useCallback(async () => {
    await createNewSession();
  }, [createNewSession]);

  useEffect(() => {
    async function loadInitialData() {
      setIsInitialLoading(true);
      try {
        const sessions = await getChatSessions();
        if (sessions.length > 0) {
          setChatSessions(sessions);
          const lastActiveId = localStorage.getItem('activeChatSessionId');
          if (lastActiveId && sessions.find(s => s.id === lastActiveId)) {
            setActiveChatSessionId(lastActiveId);
          } else {
            setActiveChatSessionId(sessions[0].id);
          }
        } else {
          await createNewSession();
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
        await createNewSession();
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadInitialData();
  }, [createNewSession]);


  useEffect(() => {
    if (activeChatSessionId) {
      localStorage.setItem('activeChatSessionId', activeChatSessionId);
    }
  }, [activeChatSessionId]);


  const handleLoadSession = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
  };

  const handleSendMessage = async (userInput: string, context: QuickReply['context']) => {
    if (!activeChatSessionId) {
      console.error("No active chat session.");
      return;
    }
    
    let sessionToUpdate = chatSessions.find(s => s.id === activeChatSessionId);
    if (!sessionToUpdate) {
        console.error("Active session not found in state.");
        return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    // Optimistically update UI
    const isFirstMeaningfulMessage = sessionToUpdate.messages.filter(m => m.sender === 'user').length === 0;
    const newName = isFirstMeaningfulMessage ? generateSessionName([userMessage]) : sessionToUpdate.name;
    
    const updatedMessages = [...sessionToUpdate.messages, userMessage];
    const updatedSession = { ...sessionToUpdate, messages: updatedMessages, lastActivity: new Date(), name: newName };

    setChatSessions(prevSessions => 
        prevSessions.map(s => s.id === activeChatSessionId ? updatedSession : s)
                    .sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    );
    setIsLoading(true);

    // Persist user message and update session name if needed
    await addMessageToSession(activeChatSessionId, userMessage);
    if (isFirstMeaningfulMessage) {
        await updateSessionName(activeChatSessionId, newName);
    }


    try {
      const botResponseText = await getBotResponse(userInput, context, activeChatSessionId);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        avatar: true,
      };

      // Persist bot message
      await addMessageToSession(activeChatSessionId, botMessage);
      
      // Update UI with final state from server
      const sessions = await getChatSessions();
      setChatSessions(sessions);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessageText = "Sorry, I couldn't connect to the server. Please try again later.";
      const errorBotMessage: Message = {
        id: crypto.randomUUID(),
        text: errorMessageText,
        sender: 'bot',
        timestamp: new Date(),
        avatar: true,
      };
      await addMessageToSession(activeChatSessionId, errorBotMessage);
      const sessions = await getChatSessions();
      setChatSessions(sessions);
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = chatSessions.find(s => s.id === activeChatSessionId)?.messages || [];

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ChatHistorySidebar
        sessions={chatSessions}
        activeSessionId={activeChatSessionId}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
      />
      <main className="flex flex-col flex-1 h-full overflow-y-auto bg-white relative">
        {activeChatSessionId && activeMessages.length > 0 ? (
           <ChatInterface
            key={activeChatSessionId}
            messages={activeMessages}
            onSendMessageSubmit={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground p-4">
             { !isInitialLoading && <p>Select a chat session or start a new one.</p> }
          </div>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNewChat}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-accent"
                size="icon"
              >
                <Plus className="h-7 w-7" />
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-foreground text-background">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </main>
    </>
  );
}
