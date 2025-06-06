'use client';

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BotMessageSquare, UserCircle } from 'lucide-react'; // UserCircle as a generic user avatar

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex items-end max-w-xs md:max-w-md lg:max-w-lg', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {!isUser && (
          <div className="flex-shrink-0 mr-2 self-start mt-1">
             {message.avatar ? <BotMessageSquare className="h-8 w-8 text-primary" /> : <div className="w-8"></div>}
          </div>
        )}
         {isUser && (
          <div className="flex-shrink-0 ml-2 self-start mt-1">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div
          className={cn(
            'p-3 rounded-xl shadow-sm',
            isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <p
            className={cn(
              'text-xs mt-1',
              isUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'
            )}
          >
            {format(new Date(message.timestamp), 'p')}
          </p>
        </div>
      </div>
    </div>
  );
}
