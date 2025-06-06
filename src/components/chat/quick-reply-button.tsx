'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickReplyButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function QuickReplyButton({ text, onClick, disabled }: QuickReplyButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-accent text-accent-foreground hover:bg-accent/90 border-accent hover:border-accent/90 rounded-full shadow-sm transition-all duration-150 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:hover:scale-100"
      )}
    >
      {text}
    </Button>
  );
}
