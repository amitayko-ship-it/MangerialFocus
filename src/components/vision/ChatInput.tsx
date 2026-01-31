import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isRTL?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  isRTL = true,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-soft">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (isRTL ? 'כתוב את התשובה שלך...' : 'Write your answer...')}
        disabled={disabled}
        dir={isRTL ? 'rtl' : 'ltr'}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent border-none outline-none text-sm px-2 py-1.5',
          'placeholder:text-muted-foreground/60',
          'disabled:opacity-50'
        )}
      />
      <Button
        size="icon"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-8 w-8 rounded-full flex-shrink-0"
      >
        <Send className={cn('h-4 w-4', isRTL && 'rotate-180')} />
      </Button>
    </div>
  );
};
