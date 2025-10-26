import { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Message } from 'mailstub-types';

interface MessageListItemProps {
  message: Message;
  isSelected: boolean;
  onSelect: (messageId: string) => void;
  onClick: (messageId: string) => void;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  // Clean up whitespace
  return text.trim().replace(/\s+/g, ' ');
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export const MessageListItem = memo(function MessageListItem({
  message,
  isSelected,
  onSelect,
  onClick,
}: MessageListItemProps) {
  const handleClick = useCallback(() => {
    onClick(message.id);
  }, [message.id, onClick]);

  const handleSelect = useCallback(() => {
    onSelect(message.id);
  }, [message.id, onSelect]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      data-testid="message-list-item"
      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-cyan-50 dark:bg-cyan-900/40'
          : !message.read
          ? 'bg-cyan-50/30 dark:bg-cyan-950/10'
          : ''
      }`}
      onClick={handleClick}
    >
      <Checkbox
        data-testid="message-checkbox"
        checked={isSelected}
        onCheckedChange={handleSelect}
        onClick={handleCheckboxClick}
        className="mt-1 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600 flex-shrink-0"
      />
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-start justify-between mb-1 gap-2 sm:gap-4">
          <div className="flex-1 min-w-0 overflow-hidden">
            <p
              data-testid="message-subject"
              className={`text-sm truncate ${
                !message.read
                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                  : 'font-medium text-slate-700 dark:text-slate-300'
              }`}
            >
              {message.subject}
            </p>
            <p 
              data-testid="message-sender"
              className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate"
            >
              {message.sender}
            </p>
          </div>
          <span 
            data-testid="message-timestamp"
            className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 ml-2"
          >
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
        <p 
          data-testid="message-body"
          className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1"
        >
          {stripHtml(message.body)}
        </p>
      </div>
    </div>
  );
});