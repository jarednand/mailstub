import { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Message } from 'mailstub-types';

interface MessageListItemProps {
  message: Message;
  isSelected: boolean;
  onSelect: (messageId: string) => void;
  onClick: (messageId: string) => void;
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  
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
      className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-cyan-50 dark:bg-cyan-950/30'
          : !message.read
          ? 'bg-cyan-50/30 dark:bg-cyan-950/10'
          : ''
      }`}
      onClick={handleClick}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleSelect}
        onClick={handleCheckboxClick}
        className="mt-1 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm truncate ${
                !message.read
                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                  : 'font-medium text-slate-700 dark:text-slate-300'
              }`}
            >
              {message.subject}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {message.sender}
            </p>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-4 whitespace-nowrap">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
          {message.body}
        </p>
      </div>
    </div>
  );
});