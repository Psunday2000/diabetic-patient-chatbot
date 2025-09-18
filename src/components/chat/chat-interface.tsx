'use client';

import type { Message, QuickReply } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './message-bubble';
import QuickReplyButton from './quick-reply-button';
import { Send, Loader2, Activity } from 'lucide-react';
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';

const quickRepliesOptions: QuickReply[] = [
  { text: "Check Symptoms", context: 'symptoms' },
  { text: "Health Questions", context: 'general_info' },
  { text: "Medication Info", context: 'general_info' },
];

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessageSubmit: (userInput: string, context: QuickReply['context']) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessageSubmit, isLoading }: ChatInterfaceProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentMessages(messages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);


  const handleSubmitLocal = async (text: string, context: QuickReply['context']) => {
    if (!text.trim()) return;
    
    setInputValue('');
    await onSendMessageSubmit(text, context);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitLocal(inputValue, 'general_info');
  };
  
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitLocal(inputValue, 'general_info');
    }
  };

  const handleQuickReplyClick = (reply: QuickReply) => {
    handleSubmitLocal(reply.text, reply.context);
  };

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden h-full">
      <header className="bg-secondary/50 px-4 py-3 border-b border-border">
          <div className="flex items-center">
              <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="text-primary h-5 w-5" />
                  </div>
              </div>
              <div className="ml-3">
                  <h2 className="text-sm font-medium text-foreground">MediBot</h2>
                  <p className="text-xs text-foreground/60">Online</p>
              </div>
          </div>
      </header>
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          {currentMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
           {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end max-w-xs md:max-w-md lg:max-w-lg flex-row">
                <div className="flex-shrink-0 mr-3 self-start mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="p-3 rounded-xl shadow-sm bg-muted text-muted-foreground rounded-bl-none">
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-muted-foreground/80">MediBot is typing</span>
                    <span className="w-2 h-2 ml-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 ml-1 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 ml-1 rounded-full bg-muted-foreground/50 animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border bg-white shadow-sm">
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
        <form onSubmit={handleSubmitForm} className="flex items-end space-x-3">
           <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 rounded-lg px-4 py-2 focus-visible:ring-offset-0 resize-none max-h-32 bg-background/30"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-full aspect-square w-11 h-11 shrink-0 bg-primary hover:bg-accent"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
