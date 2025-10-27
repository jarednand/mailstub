import { useMemo, useCallback, useState } from 'react';
import { Mail, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageListItem } from '@/components/messages/message-list-item';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { useAppContext } from '@/hooks/useAppContext';
import { useMessages } from '@/hooks/useMessages';
import { toast } from 'sonner';
import axios from 'axios';

interface MessageListProps {
  searchQuery: string;
}

export function MessageList({ searchQuery }: MessageListProps) {
  const {
    messages,
    setMessages,
    selectedProjectId,
    selectedUserId,
    selectedMessages,
    setSelectedMessages,
    setSelectedMessageId,
    setIsLoadingMessages,
    isLoadingMessages,
    users,
    projects,
  } = useAppContext();
  const { deleteMessages, markMessageAsRead } = useMessages();

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const selectedProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const userMessages = useMemo(
    () => messages.filter(m => m.userId === selectedUserId && m.projectId === selectedProjectId),
    [messages, selectedUserId, selectedProjectId]
  );

  const filteredMessages = useMemo(() => {
    return userMessages
      .filter(m => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        
        return (
          m.subject.toLowerCase().includes(query) ||
          m.body.toLowerCase().includes(query) ||
          m.sender.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [userMessages, searchQuery]);

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      const newSelected = new Set(selectedMessages);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      setSelectedMessages(newSelected);
    },
    [selectedMessages, setSelectedMessages]
  );

  const handleMessageClick = useCallback(
    (messageId: string) => {
      setSelectedMessageId(messageId);
      markMessageAsRead(messageId);
    },
    [setSelectedMessageId, markMessageAsRead]
  );

  const handleDeleteMessages = async () => {
    setIsDeleting(true);
    try {
      await deleteMessages(Array.from(selectedMessages));
      toast.success(`Deleted ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}`);
      setDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete messages');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (selectedUserId) {
      setIsLoadingMessages(true);
      
      try {
        const response = await axios.get(`/api/messages`, { params: { userId: selectedUserId }});
        
        setMessages(response.data.messages);
      } catch (error){
        toast.error('Error refreshing messages.');
      } finally {
        setIsLoadingMessages(false);
      }
    }
  }, [selectedUserId, setIsLoadingMessages, setMessages]);

  return (
    <>
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {selectedUser?.email}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedProject?.name} • {filteredMessages.length} messages
              </p>
            </div>
            <Button
              data-testid="refresh-messages-button"
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingMessages}
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh messages"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {selectedMessages.size > 0 && (
            <Button
              data-testid="delete-selected-button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialog(true)}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedMessages.size}
            </Button>
          )}
        </div>

        <div className="overflow-y-scroll h-[calc(100vh-128px)]">
          {filteredMessages.length === 0 ? (
            <div
              data-testid="empty-state"
              className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                No messages yet
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Messages will appear here when sent to this user
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMessages.map(message => (
                <MessageListItem
                  key={message.id}
                  message={message}
                  isSelected={selectedMessages.has(message.id)}
                  onSelect={handleSelectMessage}
                  onClick={handleMessageClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDeleteMessages}
        title="Confirm Deletion"
        description={`This will permanently delete ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}. This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
}