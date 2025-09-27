'use client';

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Activity, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
    <div className={cn('flex items-end max-w-full md:max-w-[65ch] min-w-0', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn("flex-shrink-0 self-start mt-1", isUser ? "ml-3" : "mr-3")}>
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", isUser ? "bg-accent/10" : "bg-primary/10")}>
             {isUser ? <User className="h-5 w-5 text-accent" /> : <Activity className="h-5 w-5 text-primary" />}
          </div>
        </div>

        <div
          className={cn(
            'p-3 rounded-xl shadow-sm',
            isUser
              ? 'bg-secondary text-secondary-foreground rounded-br-none border border-border'
              : 'bg-card text-foreground rounded-bl-none border border-border'
          )}
        >
            <p className="text-sm whitespace-pre-wrap max-w-full">{message.text}</p>
          <p
            className={cn(
              'text-xs mt-1.5',
              isUser ? 'text-secondary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'
            )}
          >
            {format(new Date(message.timestamp), 'p')}
          </p>
        </div>
      </div>
    </div>
  );
}
