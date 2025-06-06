'use client';

import type { Message, QuickReply } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './message-bubble';
import QuickReplyButton from './quick-reply-button';
import { Send, Loader2, BotMessageSquare } from 'lucide-react';
import React, { useState, useRef, useEffect, FormEvent } from 'react';

const initialBotMessage: Message = {
  id: crypto.randomUUID(),
  text: "Hi! I'm DiaChat. I'm here to help you with questions about diabetes. How can I assist you today?",
  sender: 'bot',
  timestamp: new Date(),
  avatar: true,
};

const quickRepliesOptions: QuickReply[] = [
  { text: "Symptoms", context: 'symptoms' },
  { text: "Diet Tips", context: 'general_info' },
  { text: "Medication Info", context: 'general_info' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (text: string, context: QuickReply['context']) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await getBotResponse(text, context);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Sorry, I couldn't connect to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(inputValue, 'general_info');
  };

  const handleQuickReplyClick = (reply: QuickReply) => {
    handleSendMessage(reply.text, reply.context);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-var(--header-height,4rem))] max-h-[calc(100vh-var(--header-height,4rem))] bg-background"> {/* Adjust header height if different */}
      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 sm:p-6 border-t border-border bg-background shadow-sm">
        <div className="flex flex-wrap gap-2 mb-3 justify-center sm:justify-start">
          {quickRepliesOptions.map((reply) => (
            <QuickReplyButton
              key={reply.text}
              text={reply.text}
              onClick={() => handleQuickReplyClick(reply)}
              disabled={isLoading}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-full px-4 py-2 focus-visible:ring-offset-0"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-full aspect-square w-10 h-10 shrink-0"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
