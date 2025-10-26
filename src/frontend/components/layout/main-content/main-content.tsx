import { MessageList } from '@/components/messages/message-list';
import { MessageDetailView } from '@/components/messages/message-detail-view';
import { useAppContext } from '@/hooks/useAppContext';

interface MainContentProps {
  searchQuery: string;
}

export function MainContent({ searchQuery }: MainContentProps) {
  const { selectedMessageId } = useAppContext();

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0 overflow-hidden">
      {selectedMessageId ? (
        <MessageDetailView />
      ) : (
        <MessageList searchQuery={searchQuery} />
      )}
    </div>
  );
}