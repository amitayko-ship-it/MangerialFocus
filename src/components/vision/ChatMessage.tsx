import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, User } from 'lucide-react';
import { Message } from '@/types/vision';

interface ChatMessageProps {
  message: Message;
  isRTL?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isRTL = true }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAssistant ? '' : 'mr-0 ml-auto',
        isRTL && !isAssistant && 'ml-0 mr-auto'
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-card border border-border shadow-soft'
            : 'bg-primary text-primary-foreground'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {isAssistant ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              h3: ({ children }) => <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>,
              h4: ({ children }) => <h4 className="font-semibold mt-2 mb-1">{children}</h4>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p>{message.content}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};
