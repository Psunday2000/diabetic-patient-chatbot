
'use client';

import type { Message, QuickReply } from '@/lib/types';
// import { getBotResponse } from '@/app/actions'; // Handled by parent
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './message-bubble';
import QuickReplyButton from './quick-reply-button';
import { Send, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect, FormEvent } from 'react';


const quickRepliesOptions: QuickReply[] = [
  { text: "Symptoms", context: 'symptoms' },
  { text: "Diet Tips", context: 'general_info' },
  { text: "Medication Info", context: 'general_info' },
];

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessageSubmit: (userInput: string, context: QuickReply['context']) => Promise<void>;
  isLoading: boolean;
  // key prop is used by parent to trigger re-mount/reset on session change
}

export default function ChatInterface({ messages, onSendMessageSubmit, isLoading }: ChatInterfaceProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // const scrollAreaRef = useRef<HTMLDivElement | null>(null); // Access viewport via ref if needed

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
    
    setInputValue(''); // Clear input immediately

    // Parent (HomePage) will handle adding user message, calling API, and updating the messages list.
    // ChatInterface doesn't need to manage isLoading state itself directly for API calls, it's a prop.
    await onSendMessageSubmit(text, context);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitLocal(inputValue, 'general_info');
  };

  const handleQuickReplyClick = (reply: QuickReply) => {
    handleSubmitLocal(reply.text, reply.context);
  };

  return (
    <div className="flex flex-col flex-1 bg-background overflow-hidden h-full">
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="space-y-4">
          {currentMessages.map((msg) => (
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
        <form onSubmit={handleSubmitForm} className="flex items-center space-x-2">
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
