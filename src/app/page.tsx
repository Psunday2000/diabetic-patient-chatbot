'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Message, QuickReply, ChatSession } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
import ChatInterface from '@/components/chat/chat-interface';
import ChatHistorySidebar from '@/components/chat/chat-history-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

const initialBotMessageText = "Hi! I'm DiaChat. I'm here to help you with questions about diabetes. How can I assist you today?";

function generateSessionName(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.sender === 'user');
  if (firstUserMessage && firstUserMessage.text.trim()) {
    const name = firstUserMessage.text.trim();
    return name.substring(0, 30) + (name.length > 30 ? '...' : '');
  }
  // Fallback if no user message or empty, though typically a session is named after first user input.
  return `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}


export default function HomePage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  const createNewSession = useCallback((prefilledMessages?: Message[]): ChatSession => {
    const newSessionId = crypto.randomUUID();
    const now = new Date();
    const initialMessages = prefilledMessages || [
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
      name: generateSessionName(initialMessages) || `New Chat ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: initialMessages,
      startTime: now,
      lastActivity: now,
    };
  }, []);

  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    setChatSessions(prevSessions => [newSession, ...prevSessions]); // Add to beginning for chronological order in UI (if sorted by time later)
    setActiveChatSessionId(newSession.id);
  }, [createNewSession]);

  // Load from localStorage
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
          setChatSessions(parsedSessions);
          const lastActiveId = localStorage.getItem('activeChatSessionId');
          if (lastActiveId && parsedSessions.find(s => s.id === lastActiveId)) {
            setActiveChatSessionId(lastActiveId);
          } else {
            // Sort by lastActivity and pick the most recent
             const sortedSessions = [...parsedSessions].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
             setActiveChatSessionId(sortedSessions[0].id);
          }
        } else {
          handleNewChat(); // Creates and sets a new chat if localStorage is empty
        }
      } else {
        handleNewChat(); // Creates and sets a new chat if no sessions stored
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      handleNewChat(); // Fallback to new chat on error
    } finally {
      setIsInitialLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // handleNewChat is memoized.


  // Save to localStorage
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
    let sessionToUpdate: ChatSession | undefined = chatSessions.find(s => s.id === currentSessionId);

    if (!sessionToUpdate) {
      // This case should ideally be handled by ensuring activeChatSessionId is always valid
      // or by creating a new one if it becomes invalid. For now, let's assume one is active.
      // If not, we could call handleNewChat() here and then proceed.
      // For robustness, let's ensure a session is created or found.
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

    const isFirstMeaningfulMessage = sessionToUpdate.messages.filter(m => m.sender === 'user').length === 0 && sessionToUpdate.messages.length <=1;
    const updatedName = isFirstMeaningfulMessage ? generateSessionName([userMessage]) : sessionToUpdate.name;


    // Update session with user message
    setChatSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, userMessage], lastActivity: new Date(), name: updatedName }
          : s
      )
    );
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
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ChatHistorySidebar
        sessions={[...chatSessions].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())}
        activeSessionId={activeChatSessionId}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
      />
      <SidebarInset className="flex flex-col flex-1 h-full overflow-y-auto bg-background">
        {activeChatSessionId && activeMessages.length > 0 ? (
           <ChatInterface
            key={activeChatSessionId}
            messages={activeMessages}
            onSendMessageSubmit={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground p-4">
            <p>Select a chat session from the sidebar or start a new one.</p>
          </div>
        )}
      </SidebarInset>
    </>
  );
}
