
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Message, QuickReply, ChatSession } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
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


export default function HomePage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  const createNewSession = useCallback((): ChatSession => {
    const newSessionId = crypto.randomUUID();
    const now = new Date();
    const initialMessages = [
      {
        id: crypto.randomUUID(),
        text: initialBotMessageText,
        sender: 'bot',
        timestamp: now,
        avatar: true,
      },
    ];
    return {
      id: newSessionId,
      name: `New Chat ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: initialMessages,
      startTime: now,
      lastActivity: now,
    };
  }, []);

  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    setChatSessions(prevSessions => [newSession, ...prevSessions]);
    setActiveChatSessionId(newSession.id);
  }, [createNewSession]);

  useEffect(() => {
    setIsInitialLoading(true);
    try {
      const storedSessions = localStorage.getItem('chatSessions');
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          lastActivity: new Date(s.lastActivity),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));

        if (parsedSessions.length > 0) {
          const sortedSessions = [...parsedSessions].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
          setChatSessions(sortedSessions);
          const lastActiveId = localStorage.getItem('activeChatSessionId');
          if (lastActiveId && sortedSessions.find(s => s.id === lastActiveId)) {
            setActiveChatSessionId(lastActiveId);
          } else {
             setActiveChatSessionId(sortedSessions[0].id);
          }
        } else {
          handleNewChat();
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      handleNewChat();
    } finally {
      setIsInitialLoading(false);
    }
  }, [handleNewChat]);


  useEffect(() => {
    if (!isInitialLoading && chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
    if (!isInitialLoading && activeChatSessionId) {
      localStorage.setItem('activeChatSessionId', activeChatSessionId);
    }
  }, [chatSessions, activeChatSessionId, isInitialLoading]);


  const handleLoadSession = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
  };

  const handleSendMessage = async (userInput: string, context: QuickReply['context']) => {
    let currentSessionId = activeChatSessionId;
    let sessionToUpdate = chatSessions.find(s => s.id === currentSessionId);

    if (!sessionToUpdate) {
      console.warn("No active session found, creating a new one implicitly.");
      const newSession = createNewSession();
      sessionToUpdate = newSession;
      currentSessionId = newSession.id;
      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatSessionId(newSession.id);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    const isFirstMeaningfulMessage = sessionToUpdate.messages.filter(m => m.sender === 'user').length === 0;
    const updatedName = isFirstMeaningfulMessage && userInput.trim() ? generateSessionName([userMessage]) : sessionToUpdate.name;

    const updatedSessions = chatSessions.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, userMessage], lastActivity: new Date(), name: updatedName }
        : s
    ).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    
    setChatSessions(updatedSessions);
    setIsLoading(true);

    try {
      const botResponseText = await getBotResponse(userInput, context);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        avatar: true,
      };
      setChatSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, botMessage], lastActivity: new Date() }
            : s
        )
      );
    } catch (error) {
      const errorMessageText = "Sorry, I couldn't connect to the server. Please try again later.";
      const errorBotMessage: Message = {
        id: crypto.randomUUID(),
        text: errorMessageText,
        sender: 'bot',
        timestamp: new Date(),
        avatar: true,
      };
      setChatSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorBotMessage], lastActivity: new Date() }
            : s
        )
      );
      console.error('Failed to send message:', error);
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
            <p>Select a chat session or start a new one.</p>
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
