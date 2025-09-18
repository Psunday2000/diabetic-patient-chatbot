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
        "bg-transparent text-accent border-accent/50 hover:bg-accent/10 rounded-full shadow-sm transition-all duration-150 ease-in-out",
        "disabled:bg-muted disabled:text-muted-foreground disabled:border-border"
      )}
    >
      {text}
    </Button>
  );
}
